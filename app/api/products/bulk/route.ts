import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { products } = body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return errorResponse('No products data provided', 400);
    }

    // 1. Validate all incoming products fields
    const skus = new Set<string>();
    for (const item of products) {
      if (!item.name || !item.sku || !item.category || item.unitPrice === undefined || item.costPrice === undefined) {
        return errorResponse('Missing required fields in one or more items', 400);
      }
      const skuUpper = item.sku.toUpperCase().trim();
      if (skus.has(skuUpper)) {
        return errorResponse(`Duplicate SKU code in upload: ${skuUpper}`, 400);
      }
      skus.add(skuUpper);
    }

    // 2. Check for duplicate SKUs in the database and skip them
    const existingProducts = await Product.find({
      shop: auth.shopId,
      sku: { $in: Array.from(skus) }
    });

    const existingSkusSet = new Set(existingProducts.map(p => p.sku.toUpperCase().trim()));
    const productsToProcess = products.filter(item => {
      const skuUpper = item.sku.toUpperCase().trim();
      return !existingSkusSet.has(skuUpper);
    });

    const skippedCount = existingProducts.length;

    if (productsToProcess.length === 0) {
      return successResponse({
        count: 0,
        categoriesCreated: 0,
        skippedCount,
        message: `Import complete: 0 products added. All ${skippedCount} products already exist in your inventory and were skipped.`
      }, 200);
    }

    // 3. Resolve categories (Find or Create) for filtered products
    const uniqueCategoryNames = Array.from(
      new Set(productsToProcess.map((item: any) => item.category.trim()))
    );

    // Fetch existing categories for the shop
    const existingCategories = await Category.find({
      shop: auth.shopId,
      name: { $in: uniqueCategoryNames }
    });

    const categoryMap: Record<string, string> = {};
    existingCategories.forEach((cat) => {
      categoryMap[cat.name.toLowerCase()] = cat._id.toString();
    });

    // Create missing categories
    const newCategoriesToCreate = [];
    for (const catName of uniqueCategoryNames) {
      if (!categoryMap[catName.toLowerCase()]) {
        newCategoriesToCreate.push({
          name: catName,
          shop: auth.shopId,
        });
      }
    }

    if (newCategoriesToCreate.length > 0) {
      const createdCategories = await Category.insertMany(newCategoriesToCreate);
      createdCategories.forEach((cat) => {
        categoryMap[cat.name.toLowerCase()] = cat._id.toString();
      });
    }

    // 4. Construct products list and save
    const productsToInsert = productsToProcess.map((item: any) => {
      const catName = item.category.trim();
      const catId = categoryMap[catName.toLowerCase()];

      return {
        name: item.name.trim(),
        sku: item.sku.toUpperCase().trim(),
        category: catId,
        unitPrice: Number(item.unitPrice),
        costPrice: Number(item.costPrice),
        stock: Number(item.stock || 0),
        reorderLevel: Number(item.reorderLevel || 10),
        taxApplicable: item.taxApplicable !== false,
        description: item.description ? item.description.trim() : '',
        shop: auth.shopId,
      };
    });

    const result = await Product.insertMany(productsToInsert);

    return successResponse({
      count: result.length,
      categoriesCreated: newCategoriesToCreate.length,
      skippedCount,
      message: `Successfully imported ${result.length} products and created ${newCategoriesToCreate.length} new categories.${
        skippedCount > 0 ? ` Skipped ${skippedCount} duplicate SKU products.` : ''
      }`
    }, 201);

  } catch (error: any) {
    console.error('Bulk upload products error:', error);
    return errorResponse(error.message || 'Failed to bulk upload products', 500);
  }
}
