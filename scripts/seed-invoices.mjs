/**
 * Seed Script — adds past invoices for admin@nexurah.com
 * Totals: ₹5000, ₹3000, ₹200, ₹8000, ₹2000, ₹1000 on different days
 *
 * Run: node scripts/seed-invoices.mjs
 */

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://aadhithya2102_db_user:uTyGQZ3qkJneMRYu@cluster0.bvkgk55.mongodb.net/nexBilling';

// ── Connect ──────────────────────────────────────────────────────────────────
await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to MongoDB');

// ── Minimal inline schemas (no TS, just JS) ──────────────────────────────────
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
  email: String, shop: mongoose.Schema.Types.ObjectId,
}, { strict: false }));

const Shop = mongoose.models.Shop || mongoose.model('Shop', new mongoose.Schema({}, { strict: false }));
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
const Customer = mongoose.models.Customer || mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
}, { strict: false, timestamps: true }));

// ── Find the user ─────────────────────────────────────────────────────────────
const user = await User.findOne({ email: 'admin@nexurah.com' });
if (!user) { console.error('❌ User not found'); process.exit(1); }
const shopId = user.shop;
console.log(`✅ User found — shopId: ${shopId}`);

// ── Ensure a category exists ──────────────────────────────────────────────────
let category = await Category.findOne({ shop: shopId });
if (!category) {
  category = await Category.create({ name: 'General', shop: shopId });
  console.log('📂 Created category: General');
} else {
  console.log(`📂 Using existing category: ${category.name}`);
}

// ── Upsert products (use existing if found by SKU) ────────────────────────────
const productDefs = [
  { name: 'Basmati Rice 5kg',    sku: 'SEED-RICE-5KG',   unitPrice: 500, costPrice: 380, stock: 200 },
  { name: 'Cooking Oil 1L',      sku: 'SEED-OIL-1L',     unitPrice: 150, costPrice: 110, stock: 150 },
  { name: 'Wheat Flour 10kg',    sku: 'SEED-FLOUR-10KG', unitPrice: 320, costPrice: 250, stock: 180 },
  { name: 'Toor Dal 1kg',        sku: 'SEED-DAL-1KG',    unitPrice: 140, costPrice: 100, stock: 120 },
  { name: 'Sugar 1kg',           sku: 'SEED-SUGAR-1KG',  unitPrice: 45,  costPrice: 35,  stock: 300 },
  { name: 'Biscuits Assorted',   sku: 'SEED-BISC-AST',   unitPrice: 60,  costPrice: 40,  stock: 250 },
  { name: 'Detergent Powder 1kg',sku: 'SEED-DET-1KG',    unitPrice: 120, costPrice: 90,  stock: 100 },
  { name: 'Shampoo 200ml',       sku: 'SEED-SHMP-200',   unitPrice: 180, costPrice: 130, stock: 80  },
];

const products = [];
for (const def of productDefs) {
  let p = await Product.findOne({ sku: def.sku });
  if (!p) {
    p = await Product.create({
      ...def,
      description: '',
      reorderLevel: 10,
      taxApplicable: false,
      imageUrl: '',
      category: category._id,
      shop: shopId,
    });
    console.log(`📦 Created product: ${def.name}`);
  } else {
    console.log(`📦 Using existing product: ${def.name}`);
  }
  products.push(p);
}

// ── Upsert customers ──────────────────────────────────────────────────────────
const customerDefs = [
  { name: 'Ravi Kumar',    phone: '9876543210', email: 'ravi@email.com',    customerType: 'retail' },
  { name: 'Priya Sharma',  phone: '9845001122', email: 'priya@email.com',   customerType: 'retail' },
  { name: 'Surya Traders', phone: '9900112233', email: 'surya@email.com',   customerType: 'wholesale' },
];

const customerObjs = [];
for (const def of customerDefs) {
  let c = await Customer.findOne({ phone: def.phone, shop: shopId });
  if (!c) {
    c = await Customer.create({ ...def, loyaltyPoints: 0, shop: shopId });
    console.log(`👤 Created customer: ${def.name}`);
  } else {
    console.log(`👤 Using existing customer: ${def.name}`);
  }
  customerObjs.push(c);
}

// ── Helper: build invoice items that sum to a target total ────────────────────
function buildItems(prods, targetTotal) {
  const items = [];
  let remaining = targetTotal;
  const shuffle = [...prods].sort(() => Math.random() - 0.5);
  for (let i = 0; i < shuffle.length && remaining > 0; i++) {
    const p = shuffle[i];
    const maxQty = Math.min(Math.floor(remaining / p.unitPrice), 20);
    if (maxQty < 1) continue;
    const qty = i === shuffle.length - 1 ? Math.max(1, Math.round(remaining / p.unitPrice)) : Math.ceil(maxQty * 0.6) || 1;
    const subtotal = qty * p.unitPrice;
    items.push({ product: p._id, quantity: qty, price: p.unitPrice, tax: 0, subtotal });
    remaining -= subtotal;
    if (Math.abs(remaining) < p.unitPrice) break;
  }
  return items;
}

// ── Invoice seed data ─────────────────────────────────────────────────────────
// 6 invoices on 6 different past days with the requested totals
const invoiceSeed = [
  { total: 5000, daysAgo: 25, method: 'cash',   customer: customerObjs[0] },
  { total: 3000, daysAgo: 18, method: 'card',   customer: customerObjs[1] },
  { total: 200,  daysAgo: 14, method: 'cash',   customer: customerObjs[0] },
  { total: 8000, daysAgo: 10, method: 'online', customer: customerObjs[2] },
  { total: 2000, daysAgo: 5,  method: 'cash',   customer: customerObjs[1] },
  { total: 1000, daysAgo: 2,  method: 'card',   customer: customerObjs[0] },
];

let invCounter = 5000; // start invoice number high to avoid collision

for (const seed of invoiceSeed) {
  const invoiceNumber = `INV-SEED-${invCounter++}`;

  // Skip if already exists (idempotent)
  const exists = await Invoice.findOne({ invoiceNumber });
  if (exists) { console.log(`⏭  Skipping existing: ${invoiceNumber}`); continue; }

  const items = buildItems(products, seed.total);
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

  // Set the createdAt to N days ago
  const createdAt = new Date();
  createdAt.setDate(createdAt.getDate() - seed.daysAgo);
  createdAt.setHours(Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 59), 0, 0);

  const doc = {
    invoiceNumber,
    customer: seed.customer._id,
    items,
    subtotal,
    taxAmount: 0,
    discountAmount: 0,
    total: subtotal, // use actual subtotal (close to target)
    paymentMethod: seed.method,
    paymentStatus: 'paid',
    notes: '',
    shop: shopId,
    createdAt,
    updatedAt: createdAt,
  };

  // Use insertMany with timestamps override trick
  await Invoice.collection.insertOne({ ...doc, _id: new mongoose.Types.ObjectId() });
  console.log(`✅ Invoice ${invoiceNumber} — ₹${subtotal} — ${seed.customer.name} — ${createdAt.toDateString()}`);
}

console.log('\n🎉 Seed complete!');
await mongoose.disconnect();
