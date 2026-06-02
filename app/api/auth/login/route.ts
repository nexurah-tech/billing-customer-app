import { NextRequest, NextResponse } from 'next/server';
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
    if (user.status === 'pending') {
      let shopName = 'Unknown Shop';
      let phone = 'N/A';
      let email = 'N/A';
      try {
        const shop = await Shop.findById(user.shop);
        if (shop) {
          shopName = shop.name;
          phone = shop.phone;
          email = shop.email;
        }
        
        // Prevent notification spam (check if a sign-in attempt alert was created in the last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const existingAlert = await Notification.findOne({
          title: `Terminal Sign-in Attempt`,
          message: new RegExp(user.email, 'i'),
          createdAt: { $gte: fiveMinutesAgo }
        });
        
        if (!existingAlert) {
          const adminNotif = new Notification({
            title: `Terminal Sign-in Attempt`,
            message: `Owner "${user.name}" (${user.email}) from pending terminal "${shopName}" (Phone: ${phone}) attempted to log in. Terminal activation is required.`,
            type: 'alert',
            targetShop: null,
            isAdminOnly: true,
            readBy: [],
          });
          await adminNotif.save();
        }
      } catch (notifError) {
        console.error('Error creating sign-in attempt alert for super admin:', notifError);
      }
      return NextResponse.json({
        success: false,
        error: 'Your account is pending approval by the administrator. A notification has been sent to the super admin.',
        status: 'pending',
        userName: user.name,
        role: user.role,
        shopName,
        contactPhone: phone,
        contactEmail: email,
      }, { status: 401 });
    }
    if (user.status === 'blocked') {
      console.log('=== CUSTOMER LOGIN: BLOCKED ACCOUNT ===');
      console.log('User Email:', user.email);
      
      // Fetch plain object to bypass stale schema cache in Next.js in-memory Mongoose models
      const rawUser = await User.findOne({ email: email.toLowerCase() }).lean() as any;
      const dbBlockReason = (rawUser && rawUser.blockReason) || 'Subscription Payment Overdue';
      
      console.log('Raw user blockReason in DB:', rawUser?.blockReason);
      console.log('Resolved blockReason:', dbBlockReason);
      
      let shopName = 'Unknown Shop';
      let phone = 'N/A';
      let shopEmail = 'N/A';
      try {
        const shop = await Shop.findById(user.shop);
        if (shop) {
          shopName = shop.name;
          phone = shop.phone;
          shopEmail = shop.email;
        }
      } catch (shopError) {
        console.error('Error fetching shop for blocked user login response:', shopError);
      }
      
      const responsePayload = {
        success: false,
        error: 'Your account has been suspended due to pending monthly payments. Please contact admin.',
        status: 'blocked',
        userName: user.name,
        role: user.role,
        shopName,
        contactPhone: phone,
        contactEmail: shopEmail,
        blockReason: dbBlockReason,
      };
      
      console.log('Response payload returned:', responsePayload);
      console.log('========================================');
      
      return NextResponse.json(responsePayload, { status: 401 });
    }
    if (user.status === 'rejected') {
      console.log('=== CUSTOMER LOGIN: REJECTED ACCOUNT ===');
      console.log('User Email:', user.email);
      
      let shopName = 'Unknown Shop';
      let phone = 'N/A';
      let shopEmail = 'N/A';
      try {
        const shop = await Shop.findById(user.shop);
        if (shop) {
          shopName = shop.name;
          phone = shop.phone;
          shopEmail = shop.email;
        }
      } catch (shopError) {
        console.error('Error fetching shop for rejected user login response:', shopError);
      }
      
      const responsePayload = {
        success: false,
        error: 'Your registration request has been rejected by the administrator.',
        status: 'rejected',
        userName: user.name,
        role: user.role,
        shopName,
        contactPhone: phone,
        contactEmail: shopEmail,
      };
      
      console.log('Response payload returned:', responsePayload);
      console.log('========================================');
      
      return NextResponse.json(responsePayload, { status: 401 });
    }
    if (user.status !== 'active') {
      return errorResponse('Your account is inactive.', 401);
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
