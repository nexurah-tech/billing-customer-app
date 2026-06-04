import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return a successful response even if user doesn't exist for security reasons (prevent user enumeration)
      // but log it internally or skip email. Let's return success but say "If registered, an OTP has been sent."
      return successResponse({ message: 'If the email is registered, an OTP has been sent.' });
    }

    if (user.status !== 'active') {
      return errorResponse('This account is not active. Please contact administrator.', 400);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Send email
    try {
      await sendOtpEmail(user.email, otp, user.name);
    } catch (mailError) {
      console.error('Failed to send OTP email:', mailError);
      return errorResponse('Failed to send verification email. Please try again later.', 500);
    }

    return successResponse({ message: 'Verification OTP has been sent to your email.' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return errorResponse(error.message || 'Something went wrong', 500);
  }
}
