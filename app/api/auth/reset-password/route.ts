import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return errorResponse('Email, OTP, and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse('Password must be at least 8 characters long', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('Invalid request or user not found', 404);
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return errorResponse('No verification request found. Please request a new OTP.', 400);
    }

    // Verify OTP expiry
    if (new Date() > user.resetOtpExpiry) {
      return errorResponse('Verification code has expired. Please request a new OTP.', 400);
    }

    // Verify OTP code matches
    if (user.resetOtp !== otp.trim()) {
      return errorResponse('Invalid verification code. Please try again.', 400);
    }

    // Update password
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    return successResponse({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return errorResponse(error.message || 'Something went wrong', 500);
  }
}
