import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
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

    // Pre-generate IDs to break the circular required-field dependency:
    // User requires shop, Shop requires owner — both set at construction time.
    const userId = new mongoose.Types.ObjectId();
    const shopId = new mongoose.Types.ObjectId();

    const user = new User({
      _id: userId,
      email: email.toLowerCase(),
      password,
      name,
      shop: shopId,
      role: 'owner',
      status: 'active',
    });

    const shop = new Shop({
      _id: shopId,
      name: shopName,
      phone,
      email,
      address,
      owner: userId,
    });

    // Save both — all required fields are satisfied from the start
    await user.save();
    await shop.save();

    // Generate token
    const token = generateToken({
      userId: userId.toString(),
      email: user.email,
      shopId: shopId.toString(),
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

