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
    const { email, password, name, shopName, phone, address } = body;

    // Validation
    if (!email || !password || !name || !shopName || !phone || !address) {
      return errorResponse('Missing required fields', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('Email already registered', 400);
    }

    // Create shop first
    const shop = new Shop({
      name: shopName,
      phone,
      email,
      address,
      owner: null, // Will be updated after user creation
    });
    await shop.save();

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      shop: shop._id,
      role: 'owner',
      status: 'active',
    });
    await user.save();

    // Update shop with owner reference
    shop.owner = user._id;
    await shop.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      shopId: shop._id.toString(),
      role: user.role,
    });

    return successResponse(
      {
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
      },
      201
    );
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(error.message || 'Signup failed', 500);
  }
}
