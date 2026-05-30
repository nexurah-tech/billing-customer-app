import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const categories = await Category.find({ shop: auth.shopId }).sort({
      createdAt: -1,
    });

    return successResponse({
      categories,
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return errorResponse(error.message || 'Failed to get categories', 500);
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
    const { name, description } = body;

    if (!name) {
      return errorResponse('Category name is required', 400);
    }

    const category = new Category({
      name,
      description: description || '',
      shop: auth.shopId,
    });

    await category.save();

    return successResponse(category, 201);
  } catch (error: any) {
    console.error('Create category error:', error);
    return errorResponse(error.message || 'Failed to create category', 500);
  }
}
