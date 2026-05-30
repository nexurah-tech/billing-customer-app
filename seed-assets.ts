import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import User from './models/User';
import Shop from './models/Shop';
import Settings from './models/Settings';
import Category from './models/Category';
import Product from './models/Product';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env');
  process.exit(1);
}

// 1. Data Definitions
const rawCategories = [
  { name: 'Vegetables', description: 'Organic veggies', image: 'organic_vegitable_image.png' },
  { name: 'Fruits', description: 'Fresh Fruits', image: 'fresh_fruits_image.png' },
  { name: 'Drinks', description: 'Cold Drinks', image: 'bottles_image.png' },
  { name: 'Instant', description: 'Instant Food', image: 'maggi_image.png' },
  { name: 'Dairy', description: 'Dairy Products', image: 'dairy_product_image.png' },
  { name: 'Bakery', description: 'Bakery & Breads', image: 'bakery_image.png' },
  { name: 'Grains', description: 'Grains & Cereals', image: 'grain_image.png' },
];

const rawProducts = [
  { name: "Potato 500g", category: "Vegetables", price: 25, offerPrice: 20, image: "potato_image_1.png", sku: "SKU-VEG-POTATO" },
  { name: "Tomato 1 kg", category: "Vegetables", price: 40, offerPrice: 35, image: "tomato_image.png", sku: "SKU-VEG-TOMATO" },
  { name: "Carrot 500g", category: "Vegetables", price: 30, offerPrice: 28, image: "carrot_image.png", sku: "SKU-VEG-CARROT" },
  { name: "Spinach 500g", category: "Vegetables", price: 18, offerPrice: 15, image: "spinach_image_1.png", sku: "SKU-VEG-SPINACH" },
  { name: "Onion 500g", category: "Vegetables", price: 22, offerPrice: 19, image: "onion_image_1.png", sku: "SKU-VEG-ONION" },
  
  { name: "Apple 1 kg", category: "Fruits", price: 120, offerPrice: 110, image: "apple_image.png", sku: "SKU-FRU-APPLE" },
  { name: "Orange 1 kg", category: "Fruits", price: 80, offerPrice: 75, image: "orange_image.png", sku: "SKU-FRU-ORANGE" },
  { name: "Banana 1 kg", category: "Fruits", price: 50, offerPrice: 45, image: "banana_image_1.png", sku: "SKU-FRU-BANANA" },
  { name: "Mango 1 kg", category: "Fruits", price: 150, offerPrice: 140, image: "mango_image_1.png", sku: "SKU-FRU-MANGO" },
  { name: "Grapes 500g", category: "Fruits", price: 70, offerPrice: 65, image: "grapes_image_1.png", sku: "SKU-FRU-GRAPES" },
  
  { name: "Amul Milk 1L", category: "Dairy", price: 60, offerPrice: 55, image: "amul_milk_image.png", sku: "SKU-DAI-AMULMILK" },
  { name: "Paneer 200g", category: "Dairy", price: 90, offerPrice: 85, image: "paneer_image.png", sku: "SKU-DAI-PANEER" },
  { name: "Eggs 12 pcs", category: "Dairy", price: 90, offerPrice: 85, image: "eggs_image.png", sku: "SKU-DAI-EGGS" },
  { name: "Cheese 200g", category: "Dairy", price: 140, offerPrice: 130, image: "cheese_image.png", sku: "SKU-DAI-CHEESE" },
  
  { name: "Coca-Cola 1.5L", category: "Drinks", price: 80, offerPrice: 75, image: "coca_cola_image.png", sku: "SKU-DRI-COCACOLA" },
  { name: "Pepsi 1.5L", category: "Drinks", price: 78, offerPrice: 73, image: "pepsi_image.png", sku: "SKU-DRI-PEPSI" },
  { name: "Sprite 1.5L", category: "Drinks", price: 79, offerPrice: 74, image: "sprite_image_1.png", sku: "SKU-DRI-SPRITE" },
  { name: "Fanta 1.5L", category: "Drinks", price: 77, offerPrice: 72, image: "fanta_image_1.png", sku: "SKU-DRI-FANTA" },
  { name: "7 Up 1.5L", category: "Drinks", price: 76, offerPrice: 71, image: "seven_up_image_1.png", sku: "SKU-DRI-SEVENUP" },
  
  { name: "Basmati Rice 5kg", category: "Grains", price: 550, offerPrice: 520, image: "basmati_rice_image.png", sku: "SKU-GRA-BASMATI" },
  { name: "Wheat Flour 5kg", category: "Grains", price: 250, offerPrice: 230, image: "wheat_flour_image.png", sku: "SKU-GRA-WHEATFLOUR" },
  { name: "Organic Quinoa 500g", category: "Grains", price: 450, offerPrice: 420, image: "quinoa_image.png", sku: "SKU-GRA-QUINOA" },
  { name: "Brown Rice 1kg", category: "Grains", price: 120, offerPrice: 110, image: "brown_rice_image.png", sku: "SKU-GRA-BROWNRICE" },
  { name: "Barley 1kg", category: "Grains", price: 150, offerPrice: 140, image: "barley_image.png", sku: "SKU-GRA-BARLEY" },
  
  { name: "Brown Bread 400g", category: "Bakery", price: 40, offerPrice: 35, image: "brown_bread_image.png", sku: "SKU-BAK-BROWNBREAD" },
  { name: "Butter Croissant 100g", category: "Bakery", price: 50, offerPrice: 45, image: "butter_croissant_image.png", sku: "SKU-BAK-CROISSANT" },
  { name: "Chocolate Cake 500g", category: "Bakery", price: 350, offerPrice: 325, image: "chocolate_cake_image.png", sku: "SKU-BAK-CHOCCOKE" },
  { name: "Whole Bread 400g", category: "Bakery", price: 45, offerPrice: 40, image: "whole_wheat_bread_image.png", sku: "SKU-BAK-WHOLEBREAD" },
  { name: "Vanilla Muffins 6 pcs", category: "Bakery", price: 100, offerPrice: 90, image: "vanilla_muffins_image.png", sku: "SKU-BAK-VANILLAMUFF" },
  
  { name: "Maggi Noodles 280g", category: "Instant", price: 55, offerPrice: 50, image: "maggi_image.png", sku: "SKU-INS-MAGGI" },
  { name: "Top Ramen 270g", category: "Instant", price: 45, offerPrice: 40, image: "top_ramen_image.png", sku: "SKU-INS-TOPRAMEN" },
  { name: "Knorr Cup Soup 70g", category: "Instant", price: 35, offerPrice: 30, image: "knorr_soup_image.png", sku: "SKU-INS-KNORRSOUP" },
  { name: "Yippee Noodles 260g", category: "Instant", price: 50, offerPrice: 45, image: "yippee_image.png", sku: "SKU-INS-YIPPEE" },
  { name: "Oats Noodles 72g", category: "Instant", price: 40, offerPrice: 35, image: "maggi_oats_image.png", sku: "SKU-INS-OATSMAGGI" },
];

async function uploadImageToCloudinary(filename: string): Promise<string> {
  const filePath = path.join(process.cwd(), 'assets', filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File ${filePath} not found. Skipping upload.`);
    return '';
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'billing-products',
    });
    console.log(`Uploaded ${filename} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filename} to Cloudinary:`, error);
    return '';
  }
}

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI!);
    console.log('Database connected successfully.');

    // 2. Resolve default shop & user
    let shop = await Shop.findOne();
    let user = await User.findOne({ role: 'owner' });

    if (!user) {
      console.log('No owner user found. Creating default admin user...');
      const tempUserId = new mongoose.Types.ObjectId();
      const tempShopId = new mongoose.Types.ObjectId();

      user = new User({
        _id: tempUserId,
        name: 'Nexurah Admin',
        email: 'admin@nexurah.com',
        password: 'password123',
        role: 'owner',
        status: 'active',
        shop: tempShopId,
      });
      await user.save();
      console.log('Created owner user: admin@nexurah.com / password123');

      shop = new Shop({
        _id: tempShopId,
        name: 'Nexurah BillEase',
        address: 'POS Terminal Branch #1, Chennai, IN',
        phone: '919600950190',
        email: 'admin@nexurah.com',
        owner: tempUserId,
        gstin: '33AAAAA1111A1Z1',
      });
      await shop.save();
      console.log('Created default shop: Nexurah BillEase');
    } else if (!shop) {
      console.log('Owner exists but no shop found. Creating default shop...');
      shop = new Shop({
        name: 'Nexurah BillEase',
        address: 'POS Terminal Branch #1, Chennai, IN',
        phone: '919600950190',
        email: 'admin@nexurah.com',
        owner: user._id,
        gstin: '33AAAAA1111A1Z1',
      });
      await shop.save();
      console.log('Created default shop: Nexurah BillEase');
      
      user.shop = shop._id;
      await user.save();
    }

    const shopId = shop._id;

    // 2.5 Seed default settings for this shop
    let settings = await Settings.findOne({ shop: shopId });
    if (!settings) {
      settings = new Settings({
        shop: shopId,
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
        businessHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '21:00' },
          sunday: { open: '09:00', close: '21:00' },
        },
      });
      await settings.save();
      console.log('Seeded default shop settings');
    }

    // 3. Seed Categories
    console.log('Seeding categories...');
    const categoryMap: { [key: string]: mongoose.Types.ObjectId } = {};

    for (const rawCat of rawCategories) {
      let category = await Category.findOne({ name: rawCat.name, shop: shopId });
      if (!category) {
        category = new Category({
          name: rawCat.name,
          description: rawCat.description,
          shop: shopId,
        });
        await category.save();
        console.log(`Created Category: ${rawCat.name}`);
      } else {
        console.log(`Category exists: ${rawCat.name}`);
      }
      categoryMap[rawCat.name] = category._id;
    }

    // 4. Seed Products
    console.log('Seeding products...');
    for (const rawProd of rawProducts) {
      const catId = categoryMap[rawProd.category];
      if (!catId) {
        console.warn(`Category ${rawProd.category} not found for product ${rawProd.name}. Skipping.`);
        continue;
      }

      let product = await Product.findOne({ sku: rawProd.sku, shop: shopId });
      if (!product) {
        console.log(`Uploading asset for ${rawProd.name}...`);
        const imageUrl = await uploadImageToCloudinary(rawProd.image);

        product = new Product({
          name: rawProd.name,
          description: `Premium ${rawProd.name} directly from ${rawProd.category} catalog.`,
          sku: rawProd.sku,
          category: catId,
          unitPrice: rawProd.offerPrice || rawProd.price,
          costPrice: Math.round((rawProd.offerPrice || rawProd.price) * 0.7 * 100) / 100,
          stock: 120,
          reorderLevel: 15,
          taxApplicable: true,
          imageUrl: imageUrl,
          shop: shopId,
        });
        await product.save();
        console.log(`Created Product: ${rawProd.name} (${rawProd.sku})`);
      } else {
        console.log(`Product exists: ${rawProd.name} (${rawProd.sku})`);
      }
    }

    console.log('Seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
}

seed();
