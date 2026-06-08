import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Invoice from '@/models/Invoice';
import Settings from '@/models/Settings';
import Product from '@/models/Product';
import Customer from '@/models/Customer';


async function getNextInvoiceSequence(shopId: string): Promise<number> {
  const latest = await Invoice.findOne({ shop: shopId })
    .sort({ createdAt: -1 })
    .select('invoiceNumber')
    .lean();

  if (!latest?.invoiceNumber) {
    return 1000;
  }

  const match = /-(\d+)$/.exec(latest.invoiceNumber);
  return match ? Number(match[1]) + 1 : 1000;
}

async function generateInvoiceNumber(shopId: string): Promise<string> {
  let settings = await Settings.findOne({ shop: shopId });

  if (!settings) {
    const nextSequence = await getNextInvoiceSequence(shopId);
    settings = await Settings.create({
      shop: shopId,
      invoicePrefix: 'INV',
      invoiceStartNumber: nextSequence,
      invoiceAutoSequence: true,
      taxSystem: 'GST',
      taxRates: { standard: 18, reduced: 5 },
      notificationPreferences: {
        emailNotifications: true,
        whatsappNotifications: true,
        lowStockAlert: true,
      },
    });
  }

  if (settings.invoiceAutoSequence) {
    // Sync counter with actual DB max to prevent stale-counter collisions
    const actualNext = await getNextInvoiceSequence(shopId);
    await Settings.findOneAndUpdate(
      { shop: shopId },
      { $max: { invoiceStartNumber: actualNext } }
    );

    const updated = await Settings.findOneAndUpdate(
      { shop: shopId },
      { $inc: { invoiceStartNumber: 1 } },
      { returnDocument: 'after' }
    );
    const sequence = updated ? updated.invoiceStartNumber - 1 : settings.invoiceStartNumber;
    return `${settings.invoicePrefix}-${sequence}`;
  }

  return `${settings.invoicePrefix}-${settings.invoiceStartNumber}`;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    let query: any = { shop: auth.shopId };

    if (status) {
      query.paymentStatus = status;
    }
    if (customerId) {
      query.customer = customerId;
    }

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find(query)
      .populate('customer')
      .populate('items.product')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    return successResponse({
      invoices,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return errorResponse(error.message || 'Failed to get invoices', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      customerId,
      items,
      paymentMethod,
      paymentStatus,
      discountAmount,
      taxAmount: bodyTaxAmount,
      notes,
    } = body;

    // Validation
    if (!customerId || !items || items.length === 0) {
      return errorResponse('Customer and items are required', 400);
    }

    const settings =
      await Settings.findOne({ shop: auth.shopId }) ||
      (await Settings.create({
        shop: auth.shopId,
        invoicePrefix: 'INV',
        invoiceStartNumber: 1000,
        invoiceAutoSequence: true,
        taxSystem: 'GST',
        taxRates: { standard: 18, reduced: 5 },
        notificationPreferences: {
          emailNotifications: true,
          whatsappNotifications: true,
          lowStockAlert: true,
        },
      }));

    let subtotal = 0;
    // Use the GST tax amount calculated by the frontend (e.g., 18% of subtotal)
    const taxAmount = typeof bodyTaxAmount === 'number' && bodyTaxAmount >= 0 ? bodyTaxAmount : 0;
    const processedItems = [];

    // Calculate totals and validate items
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        shop: auth.shopId,
      });

      if (!product) {
        return errorResponse(
          `Product ${item.productId} not found`,
          404
        );
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          `Insufficient stock for ${product.name}`,
          400
        );
      }

      const itemSubtotal = product.unitPrice * item.quantity;
      const itemTax = 0;

      subtotal += itemSubtotal;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.unitPrice,
        tax: itemTax,
        subtotal: itemSubtotal,
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    const total = subtotal + taxAmount - (discountAmount || 0);

    let invoiceNumber = await generateInvoiceNumber(auth.shopId);
    let invoice;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        invoice = new Invoice({
          invoiceNumber,
          customer: customerId,
          items: processedItems,
          subtotal,
          taxAmount,
          discountAmount: discountAmount || 0,
          total: Math.max(0, total),
          paymentMethod: paymentMethod || 'cash',
          paymentStatus: paymentStatus || 'unpaid',
          notes: notes || '',
          shop: auth.shopId,
        });

        await invoice.save();
        break;
      } catch (error: any) {
        if (
          error?.code === 11000 &&
          error.message?.includes('invoiceNumber') &&
          attempt < 4
        ) {
          // Re-sync counter from actual DB state before retrying
          const actualNext = await getNextInvoiceSequence(auth.shopId);
          await Settings.findOneAndUpdate(
            { shop: auth.shopId },
            { $max: { invoiceStartNumber: actualNext } }
          );
          invoiceNumber = await generateInvoiceNumber(auth.shopId);
          continue;
        }
        throw error;
      }
    }

    if (!invoice) {
      return errorResponse('Failed to create invoice after retrying', 500);
    }

    await invoice.populate('customer');
    await invoice.populate('items.product');

    return successResponse(invoice, 201);
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return errorResponse(error.message || 'Failed to create invoice', 500);
  }
}
