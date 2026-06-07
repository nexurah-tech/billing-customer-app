import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Shop from '@/models/Shop';
import Payment from '@/models/Payment';
import SystemConfig from '@/models/SystemConfig';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = extractAuthFromRequest(request);
    if (!auth) return errorResponse('Unauthorized', 401);

    const shop = await Shop.findById(auth.shopId);
    if (!shop) return errorResponse('Shop not found', 404);

    const payments = await Payment.find({ shop: shop._id }).sort({ createdAt: -1 });

    let qrConfig = await SystemConfig.findOne();
    if (!qrConfig) {
      qrConfig = await SystemConfig.create({
        paymentQrCodeUrl: 'https://res.cloudinary.com/dihkz12e6/image/upload/v1700000000/mock-qr.png',
        whatsappNumber: '+919600950190',
      });
    }

    return successResponse({
      subscription: {
        status: shop.subscriptionStatus,
        plan: shop.subscriptionPlan,
        expiresAt: shop.subscriptionExpiresAt,
        lastPaymentDate: shop.lastPaymentDate,
        trialEndsAt: shop.trialEndsAt,
      },
      payments,
      qrConfig: {
        paymentQrCodeUrl: qrConfig.paymentQrCodeUrl,
        whatsappNumber: qrConfig.whatsappNumber,
      },
    });
  } catch (error: any) {
    console.error('Fetch subscription details error:', error);
    return errorResponse(error.message || 'Failed to fetch subscription data', 500);
  }
}
