import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import User from '@/models/User';
import Shop from '@/models/Shop';
import SystemConfig from '@/models/SystemConfig';

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

    let shop = null;
    let subscriptionInfo = null;
    let qrCodeConfig = null;

    if (user.shop) {
      // Fetch shop and update last active time
      shop = await Shop.findByIdAndUpdate(
        user.shop,
        { lastActiveAt: new Date() },
        { returnDocument: 'after' }
      );

      if (shop) {
        // Fetch global QR code settings
        qrCodeConfig = await SystemConfig.findOne();
        if (!qrCodeConfig) {
          qrCodeConfig = await SystemConfig.create({
            paymentQrCodeUrl: 'https://res.cloudinary.com/dihkz12e6/image/upload/v1700000000/mock-qr.png',
            whatsappNumber: '+919600950190'
          });
        }

        const now = new Date();
        const expiresAt = new Date(shop.subscriptionExpiresAt);
        const diffTime = now.getTime() - expiresAt.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        let isExpired = now > expiresAt;
        let isGracePeriod = isExpired && diffDays <= 3;
        let isSuspended = isExpired && diffDays > 3;

        // Automatically update shop subscriptionStatus in DB if needed
        let newStatus = shop.subscriptionStatus;
        if (isSuspended) {
          newStatus = 'suspended';
        } else if (isGracePeriod) {
          newStatus = 'past_due';
        } else if (!isExpired) {
          newStatus = shop.subscriptionStatus === 'trialing' ? 'trialing' : 'active';
        }

        if (newStatus !== shop.subscriptionStatus) {
          shop.subscriptionStatus = newStatus;
          await shop.save();
        }

        subscriptionInfo = {
          status: shop.subscriptionStatus,
          expiresAt: shop.subscriptionExpiresAt,
          trialEndsAt: shop.trialEndsAt,
          isExpired,
          isGracePeriod,
          graceDaysLeft: isGracePeriod ? Math.max(0, 3 - diffDays) : 0,
          paymentQrCodeUrl: qrCodeConfig.paymentQrCodeUrl,
          whatsappNumber: qrCodeConfig.whatsappNumber,
        };

        // If subscription is suspended (expired past 3-day grace period), force user status to 'blocked'
        if (isSuspended) {
          user.status = 'blocked';
          user.blockReason = 'Subscription Payment Overdue';
          await user.save();
        }
      }
    }

    return successResponse({
      status: user.status,
      role: user.role,
      name: user.name,
      email: user.email,
      blockReason: user.blockReason,
      subscription: subscriptionInfo,
    });
  } catch (error: any) {
    console.error('Check status error:', error);
    return errorResponse(error.message || 'Failed to check status', 500);
  }
}
