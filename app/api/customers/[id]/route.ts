import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Customer from '@/models/Customer';

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

    const customer = await Customer.findOne({
      _id: id,
      shop: auth.shopId,
    });

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    return successResponse(customer);
  } catch (error: any) {
    console.error('Get customer error:', error);
    return errorResponse(error.message || 'Failed to get customer', 500);
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

    const customer = await Customer.findOne({
      _id: id,
      shop: auth.shopId,
    });

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    Object.assign(customer, body);
    await customer.save();

    return successResponse(customer);
  } catch (error: any) {
    console.error('Update customer error:', error);
    return errorResponse(error.message || 'Failed to update customer', 500);
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

    const customer = await Customer.findOneAndDelete({
      _id: id,
      shop: auth.shopId,
    });

    if (!customer) {
      return errorResponse('Customer not found', 404);
    }

    return successResponse({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return errorResponse(error.message || 'Failed to delete customer', 500);
  }
}
