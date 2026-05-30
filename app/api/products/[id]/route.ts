import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Product from '@/models/Product';

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

    const product = await Product.findOne({
      _id: id,
      shop: auth.shopId,
    }).populate('category');

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse(product);
  } catch (error: any) {
    console.error('Get product error:', error);
    return errorResponse(error.message || 'Failed to get product', 500);
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

    const product = await Product.findOne({
      _id: id,
      shop: auth.shopId,
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    Object.assign(product, body);
    await product.save();
    await product.populate('category');

    return successResponse(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    return errorResponse(error.message || 'Failed to update product', 500);
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

    const product = await Product.findOneAndDelete({
      _id: id,
      shop: auth.shopId,
    });

    if (!product) {
      return errorResponse('Product not found', 404);
    }

    return successResponse({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return errorResponse(error.message || 'Failed to delete product', 500);
  }
}
