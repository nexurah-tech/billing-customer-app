import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // day, week, month, year

    // Calculate date range
    let startDate = new Date();
    if (period === 'day') {
      startDate.setDate(startDate.getDate() - 1);
    } else if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const query = {
      shop: auth.shopId,
      createdAt: { $gte: startDate },
    };

    // Total Revenue & Orders
    const invoices = await Invoice.find(query).populate('items.product');
    const totalRevenue = invoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );
    const totalOrders = invoices.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Payment Status Breakdown
    const paymentStatusBreakdown = await Invoice.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);

    // Top Products (compute with JS for consistency)
    const productTotals: Record<
      string,
      {
        productId: string;
        productName: string;
        totalQuantity: number;
        totalRevenue: number;
      }
    > = {};

    for (const invoice of invoices) {
      for (const item of invoice.items) {
        const productId = item.product instanceof Object
          ? item.product._id?.toString() || item.product.toString()
          : item.product.toString();
        const productName = item.product && typeof item.product === 'object' && 'name' in item.product
          ? (item.product as any).name
          : 'Unknown';

        if (!productTotals[productId]) {
          productTotals[productId] = {
            productId,
            productName,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }

        productTotals[productId].totalQuantity += item.quantity;
        productTotals[productId].totalRevenue += item.subtotal;
      }
    }

    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    const totalCustomers = await Customer.countDocuments({
      shop: auth.shopId,
    });
    const activeCustomers = await Invoice.distinct('customer', query);

    // Revenue Trend (last 7 days) using JS aggregation
    const trendMap: Record<string, { revenue: number; orders: number }> = {};
    for (const invoice of invoices) {
      const day = invoice.createdAt.toISOString().slice(0, 10);
      if (!trendMap[day]) {
        trendMap[day] = { revenue: 0, orders: 0 };
      }
      trendMap[day].revenue += invoice.total;
      trendMap[day].orders += 1;
    }

    const revenueTrend = Object.entries(trendMap)
      .map(([day, values]) => ({
        _id: day,
        revenue: values.revenue,
        orders: values.orders,
      }))
      .sort((a, b) => a._id.localeCompare(b._id))
      .slice(-7);

    return successResponse({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        activeCustomers: activeCustomers.length,
      },
      paymentStatusBreakdown,
      topProducts,
      revenueTrend,
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    return errorResponse(error.message || 'Failed to get analytics', 500);
  }
}
