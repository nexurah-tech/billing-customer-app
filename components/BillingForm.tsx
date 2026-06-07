'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Search,
  ShoppingCart,
  Banknote,
  CreditCard,
  QrCode,
  UserCheck,
  Package,
  UserPlus,
  AlertCircle,
  FileText,
  Percent,
  Minus,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  ExternalLink,
  Receipt,
  Phone,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stock: number;
  category?: { _id: string; name: string } | string;
  imageUrl?: string;
  unit?: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  loyaltyPoints?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface LineItem {
  productId: string;
  quantity: number;
  price: number;
}

interface CreatedInvoice {
  _id: string;
  invoiceNumber: string;
  customer: { name: string; phone: string };
  items: Array<{ product: { name: string; sku: string }; quantity: number; price: number; subtotal: number }>;
  subtotal: number;
  taxAmount?: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
}

export function BillingForm({ onSuccess }: { onSuccess: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Bill Preview modal state
  const [billPreview, setBillPreview] = useState<CreatedInvoice | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Quick Customer Dialog state
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'retail',
  });
  const [customerModalLoading, setCustomerModalLoading] = useState(false);

  // Helper: open modal pre-filled from search query
  const openRegisterModal = (query: string) => {
    const isPhone = /^[0-9\s\-+()]{6,}$/.test(query.trim());
    setNewCustomer({
      name: isPhone ? '' : query.trim(),
      phone: isPhone ? query.replace(/[^0-9]/g, '') : '',
      email: '',
      customerType: 'retail',
    });
    setShowCustomerModal(true);
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.data.customers);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Add item by clicking catalog card
  const addCatalogueItem = (product: Product) => {
    if (product.stock <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const existingIndex = lineItems.findIndex((item) => item.productId === product._id);
    if (existingIndex > -1) {
      const updated = [...lineItems];
      if (updated[existingIndex].quantity >= product.stock) {
        alert(`Cannot add more than available stock (${product.stock} ${product.unit || 'pcs'})!`);
        return;
      }
      // If decimal item, let's step up by 1 unless it exceeds stock, in which case we cap at stock.
      const step = ['kg', 'litre', 'g', 'ml'].includes(product.unit || 'pcs') ? 0.1 : 1;
      const nextQty = parseFloat(Math.min(product.stock, updated[existingIndex].quantity + step).toFixed(2));
      updated[existingIndex].quantity = nextQty;
      setLineItems(updated);
    } else {
      // Start with 1, or the remaining stock if it's less than 1.
      const initialQty = ['kg', 'litre', 'g', 'ml'].includes(product.unit || 'pcs')
        ? Math.min(1, product.stock)
        : 1;
      setLineItems([
        ...lineItems,
        { productId: product._id, quantity: initialQty, price: product.unitPrice },
      ]);
    }
  };

  // Stepper handlers
  const incrementQty = (index: number, stockLimit: number, unit?: string) => {
    const updated = [...lineItems];
    const isDecimal = ['kg', 'litre', 'g', 'ml'].includes(unit || 'pcs');
    const step = isDecimal ? 0.1 : 1;
    const newVal = Math.min(stockLimit, parseFloat((updated[index].quantity + step).toFixed(2)));
    if (newVal === updated[index].quantity) {
      alert(`Cannot exceed active stock of ${stockLimit} ${unit || 'pcs'}!`);
      return;
    }
    updated[index].quantity = newVal;
    setLineItems(updated);
  };

  const decrementQty = (index: number, unit?: string) => {
    const updated = [...lineItems];
    const isDecimal = ['kg', 'litre', 'g', 'ml'].includes(unit || 'pcs');
    const step = isDecimal ? 0.1 : 1;
    const newVal = parseFloat((updated[index].quantity - step).toFixed(2));
    if (newVal > 0) {
      updated[index].quantity = newVal;
      setLineItems(updated);
    } else {
      removeLineItem(index);
    }
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      alert('Name and Phone are required!');
      return;
    }

    setCustomerModalLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCustomer),
      });

      const data = await response.json();
      if (data.success) {
        setCustomers([data.data, ...customers]);
        setSelectedCustomer(data.data._id);
        setShowCustomerModal(false);
        setNewCustomer({ name: '', phone: '', email: '', customerType: 'retail' });
        alert('Customer registered successfully!');
      } else {
        alert(data.error || 'Failed to create customer');
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      alert('Error creating customer');
    } finally {
      setCustomerModalLoading(false);
    }
  };

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const total = Math.max(0, subtotal - discountAmount);

  const filteredCustomers = customers.filter((c) => {
    const query = customerSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (c.name && c.name.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer) {
      alert('Please select or register a customer');
      return;
    }
    if (lineItems.length === 0) {
      alert('Please add at least one item to checkout');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: selectedCustomer,
          items: lineItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod,
          paymentStatus: 'paid',
          discountAmount,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBillPreview(data.data);
      } else {
        alert(data.error || 'Failed to create invoice');
      }
    } catch (err) {
      alert('Error creating invoice');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search and category selection
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const catId = typeof product.category === 'object' ? product.category?._id : product.category;
    const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start relative select-none">
      {/* LEFT COLUMN: 60% Width - Catalogue Grid */}
      <div className="xl:col-span-7 space-y-4">
        <Card className="p-4 border-slate-200/80 shadow-xs flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-indigo-500 size-4.5" />
                Inventory Catalogue
              </h2>
              <p className="text-[11px] text-slate-500">Tap items to add to POS ticket</p>
            </div>

            {/* Live Counter */}
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold border border-slate-200/40">
              {filteredProducts.length} items shown
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search catalogue */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search by name or SKU..."
                className="w-full bg-slate-50 border border-slate-200/60 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-4 py-2 text-xs placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            {/* Category Select filter */}
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-xl border-slate-200/60 bg-slate-50 h-9.5 text-xs text-slate-700">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id} className="text-xs">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Catalog grid */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-slate-300">
            <AlertCircle className="size-8 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No matching products found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting search query or categories filter</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0;
              const isLowStock = p.stock < 10;
              const itemsInCart = lineItems.find((item) => item.productId === p._id)?.quantity || 0;

              return (
                <div
                  key={p._id}
                  onClick={() => !isOutOfStock && addCatalogueItem(p)}
                  className={`group bg-white border rounded-2xl p-3.5 transition-all duration-300 flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer select-none border-slate-200/70 hover:border-indigo-500/30 hover:-translate-y-1 ${
                    isOutOfStock ? 'opacity-65 cursor-not-allowed bg-slate-50/65' : ''
                  }`}
                >
                  <div className="flex gap-2.5 items-start">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="size-11 rounded-xl object-cover border border-slate-200/60 shadow-3xs shrink-0"
                      />
                    ) : (
                      <div className="size-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <Package size={16} className="stroke-[1.5]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <span className="text-[9px] text-slate-400 font-mono tracking-tight truncate">{p.sku}</span>
                        {itemsInCart > 0 && (
                          <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse shrink-0">
                            {itemsInCart}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {p.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 font-medium">Selling Price</p>
                      <p className="text-sm font-black text-slate-900 mt-0.5">₹{p.unitPrice.toFixed(2)}</p>
                    </div>

                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="text-[9px] bg-red-50 text-red-600 border border-red-200/40 px-2 py-0.5 rounded-full font-bold">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200/40 px-2 py-0.5 rounded-full font-bold">
                          Stock: {p.stock} {p.unit || 'pcs'}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200/40 px-2 py-0.5 rounded-full font-bold">
                          Stock: {p.stock} {p.unit || 'pcs'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: 40% Width - POS checkout terminal */}
      <div className="xl:col-span-5 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection & Quick Add */}
          <Card className="p-4 border-slate-200/80 shadow-xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Customer Details
              </h3>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCustomerModal(true)}
                className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold gap-1 px-2.5 h-8 rounded-lg cursor-pointer"
              >
                <UserPlus size={15} />
                Quick Register
              </Button>
            </div>

            {selectedCustomer ? (
              (() => {
                const activeCust = customers.find((c) => c._id === selectedCustomer);
                return (
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="size-8.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs select-none">
                        {activeCust?.name ? activeCust.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'RG'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{activeCust?.name || 'Retail Guest'}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{activeCust?.phone || 'No phone registered'}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setSelectedCustomer('')}
                      className="text-[10px] text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold h-7.5 px-2.5 rounded-lg cursor-pointer transition-colors"
                    >
                      Change
                    </Button>
                  </div>
                );
              })()
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                  <Input
                    type="text"
                    placeholder="Search active customer by name or mobile number..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="pl-9 h-10.5 rounded-xl border-slate-200 text-xs placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white"
                  />
                </div>

                {customerSearchQuery.trim() && (
                  <div className="absolute top-11.5 inset-x-0 bg-white border border-slate-200/80 rounded-2xl shadow-lg max-h-56 overflow-y-auto z-50 divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 flex flex-col items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-700">
                            No customer found
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            &ldquo;{customerSearchQuery}&rdquo; is not in the registry
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearchQuery('');
                            openRegisterModal(customerSearchQuery);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <UserPlus size={13} />
                          Register &ldquo;{customerSearchQuery}&rdquo;
                        </button>
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            setSelectedCustomer(c._id);
                            setCustomerSearchQuery('');
                          }}
                          className="px-4 py-2.5 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                        >
                          <div>
                            <p className="font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{c.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{c.phone}</p>
                          </div>
                          <span className="text-[9px] bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider transition-colors select-none">
                            Select
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Active Cart Line Items */}
          <Card className="p-4 border-slate-200/80 shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>2. POS Ticket Cart</span>
              <ShoppingCart className="text-slate-400 size-4.5" />
            </h3>

            {lineItems.length === 0 ? (
              <div className="py-10 text-center border border-dashed rounded-xl border-slate-200">
                <ShoppingCart className="size-7 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">POS Ticket is empty</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Click catalogue items on the left to add them here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
                {lineItems.map((item, index) => {
                  const product = products.find((p) => p._id === item.productId);
                  if (!product) return null;

                  return (
                    <div key={index} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono">{product.sku}</span>
                          <span className="text-[10px] font-semibold text-slate-600">₹{item.price.toFixed(2)} / {product.unit || 'pcs'}</span>
                        </div>
                      </div>

                      {/* Stepper controls */}
                      <div className="flex items-center bg-slate-100/90 border border-slate-200/40 rounded-xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => decrementQty(index, product.unit)}
                          className="size-6 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/45 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Minus size={11} strokeWidth={3} />
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (isNaN(val) || val <= 0) return;
                            if (val > product.stock) {
                              alert(`Cannot exceed active stock of ${product.stock} ${product.unit || 'pcs'}!`);
                              return;
                            }
                            const updated = [...lineItems];
                            updated[index].quantity = val;
                            setLineItems(updated);
                          }}
                          step={['kg', 'litre', 'g', 'ml'].includes(product.unit || 'pcs') ? '0.01' : '1'}
                          className="w-12 text-center text-xs font-bold text-slate-800 bg-transparent focus:outline-none focus:ring-0 border-b border-dashed border-slate-300 focus:border-indigo-500 mx-1"
                        />
                        <button
                          type="button"
                          onClick={() => incrementQty(index, product.stock, product.unit)}
                          className="size-6 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200/45 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Plus size={11} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="text-right w-20 shrink-0">
                        <p className="text-xs font-black text-slate-950">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Payment Method Selector Grid */}
          <Card className="p-4 border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Payment Channel
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: Banknote },
                { value: 'card', label: 'Card Swipe', icon: CreditCard },
                { value: 'online', label: 'UPI / QR', icon: QrCode },
                { value: 'credit', label: 'Store Credit', icon: UserCheck },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.value;
                return (
                  <div
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex items-center gap-3 p-3.5 border-2 rounded-xl cursor-pointer transition-all duration-300 select-none ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-bold tracking-wide">{method.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Adjustments & Notes */}
          <Card className="p-4 border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>4. Adjustments & Notes</span>
              <FileText size={15} className="text-slate-400" />
            </h3>

            {/* Discount amount field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Cash Discount (₹)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-semibold focus-visible:border-indigo-500 text-slate-900 bg-white"
                />
                <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
              </div>
            </div>

            {/* POS terminal Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Terminal Receipt Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Print notes on customer invoice receipt..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                rows={2}
              />
            </div>
          </Card>

          {/* Checkout Breakdown Totals */}
          <Card className="p-4 bg-slate-900 text-white rounded-2xl border-none shadow-md space-y-3">
            <div className="space-y-1.5 border-b border-slate-800 pb-3.5 text-xs select-none">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (items sum)</span>
                <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-red-400 font-semibold">
                  <span>Special Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total Bill Amount</p>
                <p className="text-2xl font-black text-indigo-400 tracking-tight mt-1">₹{total.toFixed(2)}</p>
              </div>

              {/* Status Operational badge */}
              <span className="text-[9px] bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full text-slate-300 font-bold uppercase tracking-wider">
                Retail Invoice
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all shadow-glow cursor-pointer mt-4"
              disabled={loading}
            >
              {loading ? (
                'Publishing Invoice...'
              ) : (
                <>
                  <Sparkles size={16} className="animate-pulse" />
                  Finalize POS Ticket
                </>
              )}
            </Button>
          </Card>
        </form>
      </div>

      {/* QUICK ADD CUSTOMER DIALOG BACKDROP & MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <UserPlus size={16} className="text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Register New Customer</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">Create a customer profile to track loyalty &amp; purchase history</p>
            </div>

            <form onSubmit={createCustomer} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Name *</label>
                <Input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer Full Name"
                  className="rounded-xl border-slate-200 h-10 text-xs focus-visible:border-indigo-500 text-slate-900 bg-white"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Phone *</label>
                <Input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="rounded-xl border-slate-200 h-10 text-xs focus-visible:border-indigo-500 text-slate-900 bg-white"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Email (optional)</label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  placeholder="name@domain.com"
                  className="rounded-xl border-slate-200 h-10 text-xs focus-visible:border-indigo-500 text-slate-900 bg-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 rounded-xl h-10 text-xs font-semibold text-slate-600 border-slate-200 cursor-pointer"
                  disabled={customerModalLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl h-10 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
                  disabled={customerModalLoading}
                >
                  {customerModalLoading ? 'Saving...' : 'Register'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ===================== BILL PREVIEW MODAL ===================== */}
      {billPreview && (() => {
        const inv = billPreview;
        const customer = inv.customer;
        const createdDate = new Date(inv.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
        const createdTime = new Date(inv.createdAt).toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit',
        });

        const paymentIcons: Record<string, React.ReactNode> = {
          cash: <Banknote size={13} />,
          card: <CreditCard size={13} />,
          online: <QrCode size={13} />,
          credit: <UserCheck size={13} />,
        };

        const handleWhatsApp = () => {
          const phone = (customer?.phone || '').replace(/[^0-9]/g, '');
          const formatted = phone.length === 10 ? `91${phone}` : phone;
          let shopName = "NexBill";
          try {
            const s = localStorage.getItem('shop');
            if (s) shopName = JSON.parse(s).name || shopName;
          } catch (_) {}

          const itemLines = (inv.items || [])
            .map((it) => `  • ${it.product?.name} × ${it.quantity}  →  ₹${(it.subtotal ?? 0).toFixed(2)}`)
            .join('\n');

          const msg =
            `Hello *${customer?.name || 'Valued Customer'}*! 🛍️\n\n` +
            `Thank you for shopping at *${shopName}*.\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🧾 *Invoice ${inv.invoiceNumber}*\n` +
            `📅 ${createdDate} at ${createdTime}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `*Items Purchased:*\n${itemLines}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `Subtotal : ₹${(inv.subtotal ?? 0).toFixed(2)}\n` +
            (inv.discountAmount > 0 ? `Discount : -₹${inv.discountAmount.toFixed(2)}\n` : '') +
            `*Total : ₹${inv.total.toFixed(2)}*\n` +
            `Payment : ${(inv.paymentMethod || '').toUpperCase()}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `View receipt: ${window.location.origin}/dashboard/billing/${inv._id}\n\n` +
            `Thank you! 🙏`;

          window.location.href = `whatsapp://send?phone=${formatted}&text=${encodeURIComponent(msg)}`;
        };

        const handleNewBill = () => {
          setBillPreview(null);
          setSelectedCustomer('');
          setLineItems([]);
          setPaymentMethod('cash');
          setDiscountAmount(0);
          setNotes('');
          setSearchQuery('');
          setCustomerSearchQuery('');
          setSelectedCategory('all');
          onSuccess();
        };

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

              {/* Header — always visible */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 flex items-center gap-3 shrink-0">
                <div className="size-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm leading-tight">Invoice Published!</p>
                  <p className="text-emerald-100 text-[11px] font-medium truncate">
                    {inv.invoiceNumber} · {createdDate} · {createdTime}
                  </p>
                </div>
                <span className="text-[9px] bg-white/20 border border-white/30 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {inv.paymentStatus}
                </span>
              </div>

              {/* Body — scrollable */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1">

                {/* Customer + payment row */}
                <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="size-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs select-none shrink-0">
                    {customer?.name
                      ? customer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'RG'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate leading-tight">{customer?.name || 'Retail Guest'}</p>
                    {customer?.phone && (
                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Phone size={9} />{customer.phone}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full font-semibold shrink-0">
                    {paymentIcons[inv.paymentMethod] || <Banknote size={11} />}
                    <span>{(inv.paymentMethod || '').toUpperCase()}</span>
                  </div>
                </div>

                {/* Line Items — scrollable inner section */}
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  {/* Sticky column header */}
                  <div className="grid grid-cols-[1fr_auto_auto] px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                    <span>Item</span><span className="text-center">Qty</span><span className="text-right">Total</span>
                  </div>
                  {/* Scrollable rows — capped at ~6 items height */}
                  <div className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: '210px' }}>
                    {(inv.items || []).map((it, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr_auto_auto] items-center px-3 py-2 bg-white">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate leading-tight">{it.product?.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">₹{(it.price ?? 0).toFixed(2)} / {(it.product as any)?.unit || 'pcs'}</p>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 text-center px-3">{it.quantity} {(it.product as any)?.unit || 'pcs'}</span>
                        <span className="text-[11px] font-black text-slate-900 text-right">₹{(it.subtotal ?? 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Item count footer */}
                  <div className="px-3 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      {(inv.items || []).length} items
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                      {(inv.items || []).reduce((s: number, i: any) => s + i.quantity, 0)} units
                    </span>
                  </div>
                </div>

                {/* Totals — always visible at bottom of scroll */}
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-900 rounded-xl text-xs">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Sub <span className="text-white font-semibold">₹{(inv.subtotal ?? 0).toFixed(2)}</span></span>
                    {inv.discountAmount > 0 && (
                      <span>Off <span className="text-red-400 font-semibold">-₹{inv.discountAmount.toFixed(2)}</span></span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">Total</p>
                    <p className="text-base font-black text-indigo-400 leading-tight">₹{inv.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Notes (only if present) */}
                {inv.notes && (
                  <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/50 rounded-lg px-3 py-1.5 font-medium truncate">
                    📝 {inv.notes}
                  </p>
                )}
              </div>

              {/* Action buttons — always pinned at bottom */}
              <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-2 shrink-0 border-t border-slate-100 bg-white">
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </button>
                <a
                  href={`/dashboard/billing/${inv._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 text-indigo-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <ExternalLink size={15} />
                  View Bill
                </a>
                <button
                  onClick={handleNewBill}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer group"
                >
                  <RotateCcw size={15} className="group-hover:rotate-180 transition-transform duration-500" />
                  New Bill
                </button>
              </div>

            </div>
          </div>

        );
      })()}

    </div>
  );
}

