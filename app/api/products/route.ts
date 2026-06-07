import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Product from '@/models/Product';
import Category from '@/models/Category';


export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query: any = { shop: auth.shopId };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('category')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    return successResponse({
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return errorResponse(error.message || 'Failed to get products', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const {
      name,
      description,
      sku,
      category,
      unit,
      unitPrice,
      costPrice,
      stock,
      reorderLevel,
      taxApplicable,
      imageUrl,
    } = body;

    // Validation
    if (!name || !sku || !category || unitPrice === undefined || unitPrice === null || costPrice === undefined || costPrice === null) {
      return errorResponse('Missing required fields', 400);
    }

    // Check for duplicate SKU
    const existingSku = await Product.findOne({
      sku: sku.toUpperCase(),
      shop: auth.shopId,
    });
    if (existingSku) {
      return errorResponse('SKU already exists', 400);
    }

    const product = new Product({
      name,
      description,
      sku: sku.toUpperCase(),
      category,
      unit: unit ? unit.trim() : 'pcs',
      unitPrice,
      costPrice,
      stock: stock || 0,
      reorderLevel: reorderLevel || 10,
      taxApplicable: taxApplicable !== false,
      imageUrl,
      shop: auth.shopId,
    });

    await product.save();
    await product.populate('category');

    return successResponse(product, 201);
  } catch (error: any) {
    console.error('Create product error:', error);
    return errorResponse(error.message || 'Failed to create product', 500);
  }
}
