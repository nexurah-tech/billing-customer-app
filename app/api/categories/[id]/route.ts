import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Category from '@/models/Category';

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

    const category = await Category.findOne({
      _id: id,
      shop: auth.shopId,
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse(category);
  } catch (error: any) {
    console.error('Get category error:', error);
    return errorResponse(error.message || 'Failed to get category', 500);
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

    const category = await Category.findOne({
      _id: id,
      shop: auth.shopId,
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    Object.assign(category, body);
    await category.save();

    return successResponse(category);
  } catch (error: any) {
    console.error('Update category error:', error);
    return errorResponse(error.message || 'Failed to update category', 500);
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

    const category = await Category.findOneAndDelete({
      _id: id,
      shop: auth.shopId,
    });

    if (!category) {
      return errorResponse('Category not found', 404);
    }

    return successResponse({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return errorResponse(error.message || 'Failed to delete category', 500);
  }
}
