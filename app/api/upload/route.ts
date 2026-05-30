import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authorization
    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    // 2. Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return errorResponse('No file uploaded', 400);
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      return errorResponse('Only image files are allowed', 400);
    }

    // 3. Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // 4. Upload to Cloudinary securely
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: 'billing-products',
    });

    // 5. Return the secure URL
    return successResponse({
      imageUrl: uploadResult.secure_url,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return errorResponse(error.message || 'Failed to upload image file', 500);
  }
}
