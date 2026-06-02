import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      status: user.status,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (error: any) {
    console.error('Check status error:', error);
    return errorResponse(error.message || 'Failed to check status', 500);
  }
}
