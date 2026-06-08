import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Settings from '@/models/Settings';

const DEFAULT_SETTINGS = {
  invoicePrefix: 'INV',
  invoiceStartNumber: 1000,
  invoiceAutoSequence: true,
  taxSystem: 'GST',
  taxRates: {
    standard: 18,
    reduced: 5,
  },
  notificationPreferences: {
    emailNotifications: true,
    whatsappNotifications: true,
    lowStockAlert: true,
  },
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = extractAuthFromRequest(request);
    if (!auth) return errorResponse('Unauthorized', 401);

    let settings = await Settings.findOne({ shop: auth.shopId });
    if (!settings) {
      settings = await Settings.create({
        shop: auth.shopId,
        ...DEFAULT_SETTINGS,
      });
    }

    return successResponse({ settings });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to get settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const auth = extractAuthFromRequest(request);
    if (!auth) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const update: any = {};

    if (typeof body.invoicePrefix === 'string') {
      update.invoicePrefix = body.invoicePrefix;
    }
    if (typeof body.invoiceStartNumber === 'number') {
      update.invoiceStartNumber = body.invoiceStartNumber;
    }
    if (typeof body.invoiceAutoSequence === 'boolean') {
      update.invoiceAutoSequence = body.invoiceAutoSequence;
    }
    if (typeof body.taxSystem === 'string') {
      update.taxSystem = body.taxSystem;
    }
    if (typeof body.taxRates === 'object') {
      update.taxRates = {
        ...body.taxRates,
      };
    }
    if (typeof body.notificationPreferences === 'object') {
      update.notificationPreferences = {
        ...body.notificationPreferences,
      };
    }

    const settings = await Settings.findOneAndUpdate(
      { shop: auth.shopId },
      { $set: update },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    if (!settings) return errorResponse('Settings not found', 404);

    return successResponse({ settings });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to update settings', 500);
  }
}
