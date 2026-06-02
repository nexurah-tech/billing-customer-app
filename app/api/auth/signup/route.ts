import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Notification from '@/models/Notification';


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
      status: 'pending',
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

    // Create a notification for Super Admin
    try {
      const adminNotif = new Notification({
        title: `Approval Request: ${shopName}`,
        message: `New shop registration request: Owner "${name}" registered "${shopName}" (Email: ${email}, Phone: ${phone}). Awaiting approval.`,
        type: 'alert',
        targetShop: null,
        isAdminOnly: true,
        readBy: [],
      });
      await adminNotif.save();
    } catch (notifError) {
      console.error('Error creating super admin notification on signup:', notifError);
    }

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

    // Parse and simplify error messages — never expose raw DB errors
    let friendlyError = 'Registration failed. Please try again.';

    if (error.code === 11000) {
      // Duplicate key (e.g., email already exists)
      friendlyError = 'This email address is already registered. Please sign in instead.';
    } else if (error.name === 'ValidationError' && error.errors) {
      // Mongoose field validation errors
      const fieldErrors: string[] = [];
      for (const field in error.errors) {
        const fieldError = error.errors[field];
        if (field === 'password') {
          fieldErrors.push('Password must be at least 8 characters and include numbers and symbols.');
        } else if (field === 'email') {
          fieldErrors.push('Please enter a valid email address.');
        } else if (field === 'phone') {
          fieldErrors.push('Phone number must be exactly 10 digits.');
        } else if (field === 'status') {
          // Internal field — don't expose it
        } else {
          fieldErrors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is invalid or missing.`);
        }
      }
      if (fieldErrors.length > 0) {
        friendlyError = fieldErrors.join(' ');
      }
    } else if (error.message?.toLowerCase().includes('password')) {
      friendlyError = 'Password must be at least 8 characters and include numbers and symbols.';
    } else if (error.message?.toLowerCase().includes('email')) {
      friendlyError = 'Please enter a valid email address.';
    } else if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('connect')) {
      friendlyError = 'Unable to connect to the server. Please check your connection and try again.';
    }

    return errorResponse(friendlyError, 500);
  }
}

