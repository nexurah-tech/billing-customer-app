import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Invoice from '@/models/Invoice';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const invoice = await Invoice.findOne({
      _id: id,
      shop: auth.shopId,
    })
      .populate('customer')
      .populate('items.product');

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    return successResponse(invoice);
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return errorResponse(error.message || 'Failed to get invoice', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { paymentStatus, notes } = body;

    const invoice = await Invoice.findOne({
      _id: id,
      shop: auth.shopId,
    });

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    if (paymentStatus) {
      invoice.paymentStatus = paymentStatus;
    }
    if (notes !== undefined) {
      invoice.notes = notes;
    }

    await invoice.save();
    await invoice.populate('customer');
    await invoice.populate('items.product');

    return successResponse(invoice);
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return errorResponse(error.message || 'Failed to update invoice', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const invoice = await Invoice.findOneAndDelete({
      _id: id,
      shop: auth.shopId,
    });

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    return successResponse({ message: 'Invoice deleted successfully' });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return errorResponse(error.message || 'Failed to delete invoice', 500);
  }
}
