import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Resolve current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables.');
  process.exit(1);
}

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    console.log('🔍 Fetching existing indexes for "products" collection...');
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes.map(idx => idx.name));

    // Check if the old global unique index "sku_1" exists
    const hasSkuIndex = indexes.some(idx => idx.name === 'sku_1');
    if (hasSkuIndex) {
      console.log('🗑️  Found global unique index "sku_1". Dropping it...');
      await collection.dropIndex('sku_1');
      console.log('✅ Global unique index "sku_1" dropped successfully.');
    } else {
      console.log('ℹ️  Global unique index "sku_1" was not found (already dropped or not created).');
    }

    // Check if the compound index "shop_1_sku_1" exists
    const hasCompoundIndex = indexes.some(idx => idx.name === 'shop_1_sku_1');
    if (!hasCompoundIndex) {
      console.log('🏗️  Creating shop-scoped compound unique index { shop: 1, sku: 1 }...');
      await collection.createIndex({ shop: 1, sku: 1 }, { unique: true });
      console.log('✅ Compound unique index "shop_1_sku_1" created successfully.');
    } else {
      console.log('ℹ️  Compound unique index "shop_1_sku_1" already exists.');
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed with error:', error);
    process.exit(1);
  }
}

migrate();
