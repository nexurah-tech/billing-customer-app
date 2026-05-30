import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Shop from '@/models/Shop';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = extractAuthFromRequest(request);
    if (!auth) return errorResponse('Unauthorized', 401);

    const shop = await Shop.findById(auth.shopId).select('-owner -__v');
    if (!shop) return errorResponse('Shop not found', 404);

    return successResponse({ shop });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to get shop', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const auth = extractAuthFromRequest(request);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    // email is NOT updatable — strip it out
    const { name, phone, address, gstin } = body;

    const shop = await Shop.findByIdAndUpdate(
      auth.shopId,
      { name, phone, address, gstin },
      { new: true, runValidators: true }
    );

    if (!shop) return errorResponse('Shop not found', 404);

    return successResponse({ shop });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update shop', 500);
  }
}
