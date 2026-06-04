import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const shopId = new mongoose.Types.ObjectId(auth.shopId);
    const userId = new mongoose.Types.ObjectId(auth.userId);

    // Fetch notifications: direct alerts for this shop OR global broadcasts
    // Exclude admin-only notifications and explicit admin alert types
    const notifications = await Notification.find({
      isAdminOnly: { $ne: true },
      title: { $nin: [/Terminal Sign-in Attempt/i, /Approval Request/i] },
      $or: [
        { targetShop: shopId },
        { targetShop: { $in: [null, undefined] } },
      ],
    }).sort({ createdAt: -1 }).lean();

    // Compute unread count and map items
    const formattedNotifications = notifications.map((n) => {
      const isRead = n.readBy.some((id: mongoose.Types.ObjectId) => id.toString() === userId.toString());
      return {
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead,
        createdAt: n.createdAt,
      };
    });

    const unreadCount = formattedNotifications.filter((n) => !n.isRead).length;

    return successResponse({
      notifications: formattedNotifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Fetch notifications error:', error);
    return errorResponse(error.message || 'Failed to get notifications', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const shopId = new mongoose.Types.ObjectId(auth.shopId);
    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all applicable notifications as read
      const notifications = await Notification.find({
        isAdminOnly: { $ne: true },
        title: { $nin: [/Terminal Sign-in Attempt/i, /Approval Request/i] },
        $or: [
          { targetShop: shopId },
          { targetShop: null },
        ],
        readBy: { $ne: userId },
      });

      for (const n of notifications) {
        n.readBy.push(userId);
        await n.save();
      }

      return successResponse({ success: true, message: 'All notifications marked as read' });
    }

    if (!notificationId) {
      return errorResponse('Missing notificationId', 400);
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    // Check if user has already read it
    const alreadyRead = notification.readBy.some((id: mongoose.Types.ObjectId) => id.toString() === userId.toString());
    if (!alreadyRead) {
      notification.readBy.push(userId);
      await notification.save();
    }

    return successResponse({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Update notification error:', error);
    return errorResponse(error.message || 'Failed to update notification', 500);
  }
}
