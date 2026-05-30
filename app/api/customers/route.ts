import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Customer from '@/models/Customer';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    let query: any = { shop: auth.shopId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    return successResponse({
      customers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get customers error:', error);
    return errorResponse(error.message || 'Failed to get customers', 500);
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
      name,
      email,
      phone,
      address,
      customerType,
      gstNumber,
    } = body;

    // Validation
    if (!name || !phone) {
      return errorResponse('Name and phone are required', 400);
    }

    const customer = new Customer({
      name,
      email: email || '',
      phone,
      address: address || '',
      customerType: customerType || 'retail',
      gstNumber: gstNumber || '',
      shop: auth.shopId,
      loyaltyPoints: 0,
    });

    await customer.save();

    return successResponse(customer, 201);
  } catch (error: any) {
    console.error('Create customer error:', error);
    return errorResponse(error.message || 'Failed to create customer', 500);
  }
}
