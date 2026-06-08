import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api';
import { extractAuthFromRequest } from '@/lib/auth';
import Category from '@/models/Category';
import Product from '@/models/Product';

const defaultCategories = [
  { name: 'Groceries', description: 'Cooking ingredients, staples, and daily grocery items' },
  { name: 'Beverages', description: 'Cold drinks, juices, soda, water, tea, and coffee' },
  { name: 'Snacks', description: 'Chips, crackers, cookies, chocolates, and packaged foods' },
  { name: 'Electronics', description: 'Smart devices, computer accessories, cables, and hardware' },
  { name: 'Clothing & Apparel', description: 'Men\'s, women\'s, and children\'s apparel' },
  { name: 'Stationery', description: 'Notebooks, pens, paper, calculators, and office supplies' },
  { name: 'Household', description: 'Cleaning supplies, kitchen utilities, and home goods' },
  { name: 'Dairy & Bakery', description: 'Milk, cheese, butter, fresh bread, and bakery items' }
];

const defaultProducts = [
  {
    name: "Organic Tomato 1kg",
    category: "Groceries",
    unitPrice: 45.00,
    costPrice: 28.00,
    sku: "SKU-GRO-TOMATO",
    unit: "kg",
    stock: 120,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Basmati Rice 5kg",
    category: "Groceries",
    unitPrice: 580.00,
    costPrice: 410.00,
    sku: "SKU-GRO-RICE",
    unit: "pack",
    stock: 60,
    reorderLevel: 8,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Premium Olive Oil 1L",
    category: "Groceries",
    unitPrice: 890.00,
    costPrice: 650.00,
    sku: "SKU-GRO-OLIVE",
    unit: "litre",
    stock: 35,
    reorderLevel: 5,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Coca-Cola 1.5L Can",
    category: "Beverages",
    unitPrice: 85.00,
    costPrice: 55.00,
    sku: "SKU-BEV-COKE",
    unit: "pcs",
    stock: 200,
    reorderLevel: 25,
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Orange Juice 1L",
    category: "Beverages",
    unitPrice: 110.00,
    costPrice: 75.00,
    sku: "SKU-BEV-OJUICE",
    unit: "pcs",
    stock: 90,
    reorderLevel: 10,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Potato Chips Salted 150g",
    category: "Snacks",
    unitPrice: 60.00,
    costPrice: 38.00,
    sku: "SKU-SNA-CHIPS",
    unit: "pcs",
    stock: 150,
    reorderLevel: 20,
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Chocolate Chip Cookies",
    category: "Snacks",
    unitPrice: 120.00,
    costPrice: 78.00,
    sku: "SKU-SNA-COOKIES",
    unit: "pcs",
    stock: 80,
    reorderLevel: 12,
    imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Fresh Whole Milk 1L",
    category: "Dairy & Bakery",
    unitPrice: 65.00,
    costPrice: 45.00,
    sku: "SKU-DAI-MILK",
    unit: "litre",
    stock: 180,
    reorderLevel: 30,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Salted Butter 500g",
    category: "Dairy & Bakery",
    unitPrice: 240.00,
    costPrice: 175.00,
    sku: "SKU-DAI-BUTTER",
    unit: "pcs",
    stock: 50,
    reorderLevel: 10,
    imageUrl: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Chocolate Cake 500g",
    category: "Dairy & Bakery",
    unitPrice: 380.00,
    costPrice: 240.00,
    sku: "SKU-BAK-CHOC",
    unit: "pcs",
    stock: 15,
    reorderLevel: 3,
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Wireless Optical Mouse",
    category: "Electronics",
    unitPrice: 499.00,
    costPrice: 310.00,
    sku: "SKU-ELC-WMOUSE",
    unit: "pcs",
    stock: 75,
    reorderLevel: 10,
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "USB-C Fast Charger",
    category: "Electronics",
    unitPrice: 350.00,
    costPrice: 195.00,
    sku: "SKU-ELC-CHARGER",
    unit: "pcs",
    stock: 120,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1619134185799-a864d4b14d2e?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Classic Ballpoint Pens (10-pack)",
    category: "Stationery",
    unitPrice: 100.00,
    costPrice: 60.00,
    sku: "SKU-STA-PENS",
    unit: "box",
    stock: 110,
    reorderLevel: 15,
    imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80"
  },
  {
    name: "Dishwashing Liquid 750ml",
    category: "Household",
    unitPrice: 135.00,
    costPrice: 90.00,
    sku: "SKU-HOU-SOAP",
    unit: "pcs",
    stock: 85,
    reorderLevel: 12,
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80"
  }
];

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = extractAuthFromRequest(request);
    if (!auth) {
      return errorResponse('Unauthorized', 401);
    }

    const shopId = auth.shopId;

    // 1. Ensure categories exist
    const categoryMap: Record<string, any> = {};
    for (const cat of defaultCategories) {
      let doc = await Category.findOne({ name: cat.name, shop: shopId });
      if (!doc) {
        doc = await Category.create({
          name: cat.name,
          description: cat.description,
          shop: shopId
        });
      }
      categoryMap[cat.name] = doc._id;
    }

    // 2. Ensure products exist
    let seededCount = 0;
    for (const p of defaultProducts) {
      const catId = categoryMap[p.category];
      if (!catId) continue;

      const existing = await Product.findOne({ sku: p.sku, shop: shopId });
      if (!existing) {
        await Product.create({
          name: p.name,
          description: `Seeded ${p.name} category item.`,
          sku: p.sku,
          category: catId,
          unitPrice: p.unitPrice,
          costPrice: p.costPrice,
          stock: p.stock,
          reorderLevel: p.reorderLevel,
          unit: p.unit,
          taxApplicable: true,
          imageUrl: p.imageUrl,
          shop: shopId
        });
        seededCount += 1;
      }
    }

    return successResponse({
      message: `Successfully seeded ${seededCount} sample products!`,
      seededCount
    }, 201);

  } catch (error: any) {
    console.error('Seeding products error:', error);
    return errorResponse(error.message || 'Failed to seed products', 500);
  }
}
