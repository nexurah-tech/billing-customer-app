/**
 * One-time migration: replace the global unique index on `invoiceNumber`
 * with a per-shop compound unique index { shop, invoiceNumber }.
 *
 * The old global unique index caused invoice creation to fail for any shop
 * whose generated number (INV-1000, ...) collided with another shop's number.
 *
 * Safe to run multiple times (idempotent). Usage:  node scripts/fix-invoice-index.mjs
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set.');
  process.exit(1);
}

await mongoose.connect(uri);
const coll = mongoose.connection.db.collection('invoices');

const indexes = await coll.indexes();
console.log('Current indexes:', indexes.map((i) => i.name).join(', '));

// Drop the legacy global unique index on invoiceNumber, whatever its name.
for (const idx of indexes) {
  const keys = Object.keys(idx.key);
  const isGlobalInvoiceNumber =
    keys.length === 1 && idx.key.invoiceNumber === 1;
  if (isGlobalInvoiceNumber) {
    console.log(`Dropping legacy index "${idx.name}" ...`);
    await coll.dropIndex(idx.name);
  }
}

// Create the compound per-shop unique index (no-op if it already exists).
console.log('Ensuring compound unique index { shop: 1, invoiceNumber: 1 } ...');
await coll.createIndex({ shop: 1, invoiceNumber: 1 }, { unique: true });

console.log('Final indexes:', (await coll.indexes()).map((i) => i.name).join(', '));
console.log('Done.');

await mongoose.disconnect();
