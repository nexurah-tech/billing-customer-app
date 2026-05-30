import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';
import Shop from '@/models/Shop';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return errorResponse('Email and password are required', 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      return errorResponse('Account is inactive', 401);
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Get shop
    const shop = await Shop.findById(user.shop);
    if (!shop) {
      return errorResponse('Shop not found', 404);
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      shopId: shop._id.toString(),
      role: user.role,
    });

    return successResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      shop: {
        id: shop._id,
        name: shop.name,
      },
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Login failed', 500);
  }
}
