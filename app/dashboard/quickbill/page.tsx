'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Minus,
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
  Sparkles,
  CheckCircle2,
  MessageCircle,
  RotateCcw,
  Printer,
  ChevronRight,
  Phone,
  Zap,
  X,
  FileText,
  Clock,
  Laptop,
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stock: number;
  category?: { _id: string; name: string } | string;
  imageUrl?: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints?: number;
}

interface LineItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  stockLimit: number;
}

// Multi-Tab POS Cart Interface
interface BillingTab {
  id: string;
  name: string;
  selectedCustomerId: string; // Empty means Retail Guest
  customerSearchQuery: string;
  lineItems: LineItem[];
  paymentMethod: string; // cash, card, online
  discountAmount: number;
  applyGst: boolean;
  cashTendered: number | '';
  notes: string;
}

interface CreatedInvoice {
  _id: string;
  invoiceNumber: string;
  customer: { name: string; phone: string };
  items: Array<{
    product: { name: string; sku: string };
    quantity: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxAmount?: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
}

export default function QuickBillMultiTabPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Catalog search input query
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);

  // Reset index when search query changes
  useEffect(() => {
    setSearchSelectedIndex(0);
  }, [searchQuery]);

  // Multi-Tab state - Initialize with exactly ONE tab at startup
  const [tabs, setTabs] = useState<BillingTab[]>([
    { id: '1', name: 'Tab 1', selectedCustomerId: '', customerSearchQuery: '', lineItems: [], paymentMethod: 'cash', discountAmount: 0, applyGst: true, cashTendered: '', notes: '' },
  ]);
  const [activeTabId, setActiveTabId] = useState('1');

  // Customer register modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    customerType: 'retail',
  });
  const [customerModalLoading, setCustomerModalLoading] = useState(false);

  // Success Invoice Approved Modal
  const [billPreview, setBillPreview] = useState<CreatedInvoice | null>(null);
  const [loading, setLoading] = useState(false);

  // Focus ref for search box
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Clock
  const [currentTime, setCurrentTime] = useState('');
  const clockIntervalRef = useRef<any>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    if (barcodeInputRef.current) barcodeInputRef.current.focus();

    // Clock auto-update
    setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    clockIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    let handleOnline: () => void;
    let handleOffline: () => void;
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      handleOnline = () => setIsOffline(false);
      handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  // Global POS Hotkeys (Alt + N / F4 to add new tab, Alt + [1-9] to switch active tab)
  useEffect(() => {
    const handleGlobalHotkeys = (e: KeyboardEvent) => {
      // Trigger Alt + N / F4 anywhere (even inside input fields, to allow cashier speed)
      if ((e.altKey && e.key.toLowerCase() === 'n') || e.key === 'F4') {
        e.preventDefault();
        addNewTab();
      }

      // Switch tabs: Alt + 1, Alt + 2... (always allowed)
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        const index = parseInt(e.key) - 1;
        if (tabs[index]) {
          e.preventDefault();
          setActiveTabId(tabs[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalHotkeys);
    return () => window.removeEventListener('keydown', handleGlobalHotkeys);
  }, [tabs]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown || searchedProducts.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev + 1) % searchedProducts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev - 1 + searchedProducts.length) % searchedProducts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedProduct = searchedProducts[searchSelectedIndex];
      if (selectedProduct) {
        addProductToActiveCart(selectedProduct);
        setSearchQuery('');
        setShowSearchDropdown(false);
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchDropdown(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setProducts(data.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/customers?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setCustomers(data.data.customers);
    } catch (err) {
      console.error(err);
    }
  };

  // Switch Active Hold Tab
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = (updates: Partial<BillingTab>) => {
    setTabs(
      tabs.map((tab) => (tab.id === activeTabId ? { ...tab, ...updates } : tab))
    );
  };

  // Add Dynamic Hold Tab
  const addNewTab = () => {
    const newId = String(Date.now());
    const newTabNumber = tabs.length + 1;
    const newTab: BillingTab = {
      id: newId,
      name: `Tab ${newTabNumber}`,
      selectedCustomerId: '',
      customerSearchQuery: '',
      lineItems: [],
      paymentMethod: 'cash',
      discountAmount: 0,
      applyGst: true,
      cashTendered: '',
      notes: '',
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  // Close Hold Tab
  const closeTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      alert('Must keep at least one active cashier tab open.');
      return;
    }
    const filtered = tabs.filter((t) => t.id !== tabId);
    setTabs(filtered);
    if (activeTabId === tabId) {
      setActiveTabId(filtered[0].id);
    }
  };

  // Add Product to Cart
  const addProductToActiveCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const items = [...activeTab.lineItems];
    const idx = items.findIndex((item) => item.productId === product._id);

    if (idx > -1) {
      if (items[idx].quantity >= product.stock) {
        alert(`Insufficient stock! Only ${product.stock} units available.`);
        return;
      }
      items[idx].quantity += 1;
    } else {
      items.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        price: product.unitPrice,
        quantity: 1,
        stockLimit: product.stock,
      });
    }

    updateActiveTab({ lineItems: items });
  };

  // Quantity Incrementor / Decrementor
  const updateQty = (itemIndex: number, diff: number) => {
    const items = [...activeTab.lineItems];
    const newQty = items[itemIndex].quantity + diff;

    if (newQty <= 0) {
      items.splice(itemIndex, 1);
    } else {
      if (newQty > items[itemIndex].stockLimit) {
        alert(`Cannot exceed available stock limit of ${items[itemIndex].stockLimit} units!`);
        return;
      }
      items[itemIndex].quantity = newQty;
    }

    updateActiveTab({ lineItems: items });
  };

  const removeRow = (itemIndex: number) => {
    const items = [...activeTab.lineItems];
    items.splice(itemIndex, 1);
    updateActiveTab({ lineItems: items });
  };

  // Autocomplete search query handler
  const handleBarcodeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const match = products.find(
      (p) => p.sku.toLowerCase() === query || p.name.toLowerCase() === query
    );

    if (match) {
      addProductToActiveCart(match);
      setSearchQuery('');
      setShowSearchDropdown(false);
    } else {
      const partials = products.filter(
        (p) => p.sku.toLowerCase().includes(query) || p.name.toLowerCase().includes(query)
      );
      if (partials.length === 1) {
        addProductToActiveCart(partials[0]);
        setSearchQuery('');
        setShowSearchDropdown(false);
      } else {
        alert(`Product SKU/Item "${searchQuery}" not found.`);
      }
    }
  };

  const createCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;

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
        updateActiveTab({ selectedCustomerId: data.data._id });
        setShowCustomerModal(false);
        setNewCustomer({ name: '', phone: '', email: '', customerType: 'retail' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCustomerModalLoading(false);
    }
  };

  // Bill Calculations
  const grossTotal = activeTab.lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const gstAmount = 0; // Inclusive of GST in product price
  
  const tempTotal = grossTotal - activeTab.discountAmount;
  const total = Math.max(0, Math.round(tempTotal));
  const roundOff = total - tempTotal;

  // Tender cash balance calculator
  const balanceRefund = activeTab.cashTendered !== '' && activeTab.cashTendered >= total ? activeTab.cashTendered - total : 0;

  // Filter products by typed query
  const searchedProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredCustomers = customers.filter((c) => {
    const q = activeTab.customerSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  const handleFinalizeInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab.lineItems.length === 0) {
      alert('POS Ticket is empty! Please add products before checking out.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const finalCustId = activeTab.selectedCustomerId || customers.find(c => c.name.toLowerCase().includes('retail'))?._id || customers[0]?._id;

      if (!finalCustId) {
        alert('Please register at least one customer profile first.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: finalCustId,
          items: activeTab.lineItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          paymentMethod: activeTab.paymentMethod,
          paymentStatus: 'paid',
          discountAmount: activeTab.discountAmount,
          taxAmount: gstAmount,
          notes: activeTab.notes || 'POS Terminal Checkout',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBillPreview(data.data);
      } else {
        alert(data.error || 'Failed to checkout transaction');
      }
    } catch (err) {
      console.error(err);
      alert('Checkout failed: Connection error. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearActiveTabCart = () => {
    updateActiveTab({
      lineItems: [],
      selectedCustomerId: '',
      customerSearchQuery: '',
      discountAmount: 0,
      applyGst: true,
      cashTendered: '',
      notes: '',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans select-none relative bg-slate-50/20 min-h-screen rounded-3xl">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* ── Visual Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 select-none">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-lg text-white shadow-indigo-600/10">
            <Laptop size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Nex<span className="text-indigo-600 font-extrabold">Bill</span>
              <span className="text-slate-400 font-medium ml-2 tracking-normal text-xs sm:text-sm">Quick POS Terminal</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-2 font-semibold tracking-wide flex items-center gap-1.5">
              <Clock size={11} className="text-indigo-500 animate-pulse" />
              Cashier Register Active · Last Sync: {currentTime}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200/40 shrink-0">
          {isOffline ? (
            <span className="text-[10px] text-rose-700 px-3 py-1 rounded-lg bg-rose-50 shadow-sm font-extrabold flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
              OFFLINE MODE (SYNC PAUSED)
            </span>
          ) : (
            <span className="text-[10px] text-slate-700 px-3 py-1 rounded-lg bg-white shadow-sm font-extrabold flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 shrink-0 animate-ping" />
              ONLINE SYNC ENABLED
            </span>
          )}
        </div>
      </div>

      {/* ── Top Horizontal Billing Tabs (User Requested) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200/60 shadow-sm select-none">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth pr-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            const itemsCount = tab.lineItems.reduce((s, it) => s + it.quantity, 0);
            const customerProfileName = customers.find(c => c._id === tab.selectedCustomerId)?.name || 'Guest Checkout';

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-200 cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 font-black shadow-sm ring-2 ring-indigo-600/5'
                    : 'border-slate-100 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100/75 hover:border-slate-200 hover:text-slate-700'
                }`}
              >
                <ShoppingCart size={13} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <div className="text-left text-[11px] leading-tight">
                  <span className="tracking-wide uppercase">{tab.name}</span>
                  <span className="text-[9.5px] opacity-75 ml-2 font-semibold">({customerProfileName})</span>
                </div>
                
                <span className={`text-[9.5px] px-1.5 py-0.25 rounded font-extrabold ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/60 text-slate-600'}`}>
                  {itemsCount}
                </span>

                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => closeTab(tab.id, e)}
                    className="text-slate-400 hover:text-red-500 hover:bg-slate-100 p-0.5 rounded transition-colors"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={addNewTab}
          variant="outline"
          className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-slate-200 font-extrabold gap-1.5 px-4 py-2.5 h-9.5 rounded-xl cursor-pointer shadow-sm shrink-0 transition-transform active:scale-95 flex items-center"
          title="Shortcut: Alt + N or F4"
        >
          <Plus size={13} strokeWidth={2.5} />
          Hold New Cart
          <span className="hidden md:inline-block ml-1.5 text-[8.5px] text-slate-400 font-mono font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
            Alt + N
          </span>
        </Button>
      </div>

      {/* ── Clean Two-Column Grid Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Wide 8-Grids): Billed Items sheet gets primary importance */}
        <div className="xl:col-span-8 space-y-5 animate-in fade-in duration-200">
          
          {/* Spotlight Search Console */}
          <Card className="p-4.5 border-slate-200/80 shadow-sm bg-white rounded-2xl relative">
            <form onSubmit={handleBarcodeSearchSubmit} className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                Scan Barcode or Search Store Inventory
              </label>
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => setShowSearchDropdown(searchQuery.trim().length > 0)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Scan product code or type name (e.g. Rice, Dal)..."
                  className="w-full bg-slate-50 border border-slate-200/60 focus:border-indigo-500/80 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-10 pr-24 py-3.5 text-xs placeholder:text-slate-400 focus:outline-none transition-all font-semibold text-slate-800"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                
                {/* Keyboard Shortcut Indicator */}
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] bg-slate-100 border border-slate-200 text-slate-400 px-2 py-0.5 rounded font-mono font-bold tracking-wide select-none">
                  Enter to Add
                </span>
                
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>

            {/* Absolute overlay product results autocomplete list */}
            {showSearchDropdown && searchedProducts.length > 0 && (
              <div className="absolute top-20 inset-x-4 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-52 overflow-y-auto z-50 divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchedProducts.map((prod, idx) => {
                  const isSelected = idx === searchSelectedIndex;
                  const isLowStock = prod.stock > 0 && prod.stock <= 5;
                  const isOutOfStock = prod.stock <= 0;
                  return (
                    <div
                      key={prod._id}
                      onClick={() => {
                        addProductToActiveCart(prod);
                        setSearchQuery('');
                        setShowSearchDropdown(false);
                        if (barcodeInputRef.current) barcodeInputRef.current.focus();
                      }}
                      onMouseEnter={() => setSearchSelectedIndex(idx)}
                      className={`px-4 py-3 cursor-pointer flex items-center justify-between text-xs transition-colors group ${
                        isSelected ? 'bg-indigo-50/70 font-bold' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className={`font-extrabold transition-colors ${
                          isSelected ? 'text-indigo-700' : 'text-slate-800 group-hover:text-indigo-600'
                        }`}>{prod.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.25 rounded ${
                            isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-50 text-indigo-500'
                          }`}>{prod.sku}</span>
                          <span className={`text-[9.5px] capitalize ${isSelected ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                            {prod.category && typeof prod.category === 'object' ? prod.category.name : (prod.category || 'Store')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-black ${isSelected ? 'text-indigo-950' : 'text-slate-955'}`}>₹{prod.unitPrice.toFixed(2)}</p>
                        <p className="text-[9.5px] mt-0.5 font-bold flex items-center gap-1 justify-end">
                          <span className={`size-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className={`${isSelected ? 'text-indigo-600/70' : 'text-slate-400'} capitalize`}>
                            {isOutOfStock ? 'Out of Stock' : `Stock: ${prod.stock}`}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {showSearchDropdown && searchedProducts.length === 0 && (
              <div className="absolute top-20 inset-x-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-6 text-center z-50 text-xs text-slate-400 font-bold border-dashed">
                No matching product found in store inventory
              </div>
            )}
          </Card>

          {/* Cart Table Sheet (DOMINANT FEATURE) */}
          <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl flex flex-col gap-2 min-h-[490px] overflow-hidden">
            <div className="bg-slate-50/50 border-b border-slate-200/50 px-5 py-4 flex items-center justify-between select-none">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <ShoppingCart size={13} className="text-slate-400" />
                Active billing cart items
              </h3>
              <span className="text-[10px] bg-slate-200/60 text-slate-700 px-3 py-1 rounded-full font-bold">
                {activeTab.lineItems.length} items listed
              </span>
            </div>

            {activeTab.lineItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none bg-slate-50/10">
                <div className="size-12 bg-slate-100 border border-slate-200/40 rounded-2xl flex items-center justify-center text-slate-400 mb-4 shadow-sm select-none">
                  <ShoppingCart size={20} />
                </div>
                <p className="text-xs font-black text-slate-700">Cashier cart is empty</p>
                <p className="text-[11px] text-slate-400 mt-1.5 max-w-[280px] leading-normal font-semibold">
                  Type product name or scan barcode to add active items
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200/40 text-[9.5px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/20 select-none">
                      <th className="py-3 px-5 w-12 text-center">No</th>
                      <th className="py-3 px-5">Billed Product</th>
                      <th className="py-3 px-5 w-32">SKU Code</th>
                      <th className="py-3 px-5 w-28 text-right">Unit Price</th>
                      <th className="py-3 px-5 w-32 text-center">Quantity</th>
                      <th className="py-3 px-5 w-32 text-right">Total Amount</th>
                      <th className="py-3 px-4 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {activeTab.lineItems.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors duration-150">
                        <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-400">
                          {index + 1}
                        </td>
                        
                        <td className="py-3.5 px-5 font-black text-slate-800">
                          {item.name}
                        </td>

                        <td className="py-3.5 px-5 font-mono">
                          <span className="inline-flex items-center bg-indigo-50/50 border border-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            {item.sku}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-600">
                          ₹{item.price.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center bg-slate-100 border border-slate-200/60 rounded-xl p-0.5 mx-auto w-fit">
                            <button
                              type="button"
                              onClick={() => updateQty(index, -1)}
                              className="size-5.5 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform"
                            >
                              <Minus size={9} strokeWidth={3} />
                            </button>
                            <span className="w-8 text-center text-xs font-extrabold text-slate-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(index, 1)}
                              className="size-5.5 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95 transition-transform"
                            >
                              <Plus size={9} strokeWidth={3} />
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-right font-mono font-black text-slate-950">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN (Narrow 4-Grids): VIP Customer & Settlement Calculations */}
        <div className="xl:col-span-4 space-y-5 animate-in fade-in duration-200">
          
          {/* Customer Selection Console */}
          <Card className="p-4.5 border-slate-200/80 shadow-sm bg-white rounded-2xl space-y-3.5 relative select-none">
            <div className="flex items-center justify-between pb-1 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
                Associate Customer Profile
              </h3>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCustomerModal(true)}
                className="text-[10px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-extrabold gap-1 px-2 h-7.5 rounded-lg cursor-pointer"
              >
                <UserPlus size={12} />
                New Profile
              </Button>
            </div>

            {activeTab.selectedCustomerId ? (
              (() => {
                const activeCust = customers.find((c) => c._id === activeTab.selectedCustomerId);
                return (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-indigo-50/10 border border-slate-200/40 rounded-xl animate-in fade-in duration-200 select-none">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 select-none">
                        {activeCust?.name ? activeCust.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'RG'}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{activeCust?.name || 'Retail Guest'}</p>
                        <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span>{activeCust?.phone || 'No mobile logged'}</span>
                          {activeCust?.loyaltyPoints !== undefined && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-indigo-600 font-extrabold bg-indigo-50/50 px-1.5 py-0.25 rounded">Pts: {activeCust.loyaltyPoints}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => updateActiveTab({ selectedCustomerId: '' })}
                      className="text-[10.5px] text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold h-7.5 px-2.5 rounded-lg cursor-pointer transition-colors"
                    >
                      Reset
                    </Button>
                  </div>
                );
              })()
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                  <Input
                    type="text"
                    placeholder="Type contact number or customer name..."
                    value={activeTab.customerSearchQuery}
                    onChange={(e) => updateActiveTab({ customerSearchQuery: e.target.value })}
                    className="pl-9.5 h-10 rounded-xl border-slate-200 text-xs placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white font-medium"
                  />
                </div>

                {activeTab.customerSearchQuery.trim() && (
                  <div className="absolute top-11 inset-x-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-4 flex flex-col items-center gap-2">
                        <p className="text-xs font-black text-slate-700 text-center">No profile found</p>
                        <button
                          type="button"
                          onClick={() => {
                            const q = activeTab.customerSearchQuery;
                            updateActiveTab({ customerSearchQuery: '' });
                            const isPhone = /^[0-9\s\-+()]{6,}$/.test(q.trim());
                            setNewCustomer({
                              name: isPhone ? '' : q.trim(),
                              phone: isPhone ? q.replace(/[^0-9]/g, '') : '',
                              email: '',
                              customerType: 'retail',
                            });
                            setShowCustomerModal(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          <UserPlus size={12} />
                          Register "{activeTab.customerSearchQuery}"
                        </button>
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            updateActiveTab({ selectedCustomerId: c._id, customerSearchQuery: '' });
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <p className="font-extrabold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{c.phone}</p>
                          </div>
                          <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
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

          <form onSubmit={handleFinalizeInvoice} className="space-y-5">
            
            {/* Calculations & Settlement Method Card */}
            <Card className="p-4.5 border-slate-200/80 shadow-sm bg-white rounded-2xl space-y-4 select-none">
              
              {/* Payment selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                  Select Settlement Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Cash Tender', icon: Banknote },
                    { value: 'card', label: 'Card Swipe', icon: CreditCard },
                    { value: 'online', label: 'UPI QR Code', icon: QrCode },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = activeTab.paymentMethod === method.value;
                    return (
                      <div
                        key={method.value}
                        onClick={() => updateActiveTab({ paymentMethod: method.value })}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3.5 border rounded-xl cursor-pointer transition-all duration-200 select-none ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 shadow-sm font-extrabold ring-2 ring-indigo-600/5'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-500 font-bold'
                        }`}
                      >
                        <Icon size={15} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className="text-[10px] tracking-wide font-extrabold text-center leading-none mt-0.5">{method.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount & Billing Notes (GST automatic, switch removed) */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                    Cash Discount (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={activeTab.discountAmount || ''}
                    onChange={(e) => updateActiveTab({ discountAmount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="h-10 rounded-xl border-slate-200 text-xs font-semibold focus-visible:border-indigo-500 text-slate-900 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                    Billing Note / Memo
                  </label>
                  <Input
                    type="text"
                    value={activeTab.notes || ''}
                    onChange={(e) => updateActiveTab({ notes: e.target.value })}
                    placeholder="e.g. Home Delivery, custom order..."
                    className="h-10 rounded-xl border-slate-200 text-xs font-semibold focus-visible:border-indigo-500 text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Cash tendered details & Refund calculator */}
              {activeTab.paymentMethod === 'cash' && (
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50/50 border border-slate-200/40 p-3 rounded-2xl animate-in fade-in duration-200">
                  <div className="space-y-1 col-span-2">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                      Quick Tender Cash Amount
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                      {[
                        { label: 'Exact Bill', action: () => updateActiveTab({ cashTendered: total }) },
                        { label: '₹100', action: () => updateActiveTab({ cashTendered: 100 }) },
                        { label: '₹500', action: () => updateActiveTab({ cashTendered: 500 }) },
                        { label: '₹1000', action: () => updateActiveTab({ cashTendered: 1000 }) },
                        { label: '₹2000', action: () => updateActiveTab({ cashTendered: 2000 }) },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={preset.action}
                          className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 text-slate-600 font-extrabold rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 mt-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                      Cash Tendered (₹)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={activeTab.cashTendered || ''}
                      onChange={(e) => updateActiveTab({ cashTendered: parseFloat(e.target.value) || '' })}
                      placeholder="0.00"
                      className="h-9 rounded-xl border-slate-200 text-xs font-black focus-visible:border-indigo-500 text-slate-950 bg-white"
                    />
                  </div>

                  <div className="space-y-1 mt-1">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block pl-0.5">
                      Change to Refund
                    </label>
                    <div className="h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-between px-3 select-none">
                      <span className="text-[9.5px] text-slate-400 font-extrabold font-sans">Return:</span>
                      <span className={`text-xs font-black font-mono tracking-tight ${balanceRefund > 0 ? 'text-emerald-600 font-black' : 'text-slate-500'}`}>
                        ₹{balanceRefund.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Calculations & submit panel */}
            <Card className="p-6 bg-slate-950 border border-slate-900 text-white rounded-2xl shadow-xl space-y-4.5 relative overflow-hidden select-none">
              
              {/* Background accent ring */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.06] rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2 border-b border-slate-800 pb-4 text-xs font-semibold text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Basket Sum</span>
                  <span className="font-semibold text-white">₹{grossTotal.toFixed(2)}</span>
                </div>
                {activeTab.discountAmount > 0 && (
                  <div className="flex justify-between text-red-400 font-extrabold">
                    <span>Cash Bill Discount</span>
                    <span>-₹{activeTab.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Rounding Off</span>
                    <span>{roundOff > 0 ? '+' : ''}₹{roundOff.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Total Payable Display (Stacked for maximum breathing room and visual impact) */}
              <div className="space-y-1 pt-0.5 select-none">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">Total Cash Payable</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-black text-indigo-400 tracking-tight font-mono">₹{total.toFixed(2)}</p>
                  <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-2.5 py-0.5 rounded-lg uppercase font-bold tracking-wider">
                    {activeTab.paymentMethod.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Full-width button actions */}
              <div className="flex gap-2.5 pt-1.5">
                <Button
                  type="button"
                  onClick={clearActiveTabCart}
                  variant="ghost"
                  className="text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 text-xs font-bold h-10.5 px-4 rounded-xl cursor-pointer transition-colors"
                >
                  Void Cart
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 h-10.5 rounded-xl text-xs font-black tracking-wide shadow-md transition-all active:scale-98 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Finalize checkout'}
                </Button>
              </div>
            </Card>

          </form>
        </div>

      </div>

      {/* ── REGISTER CUSTOMER OVERLAY MODAL ── */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-200">
          <Card className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 shadow-sm">
                  <UserPlus size={15} />
                </div>
                <h3 className="text-sm font-black text-slate-900">Register New Customer</h3>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Create customer profiles for automatic invoice tracking</p>
            </div>

            <form onSubmit={createCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block pl-0.5">Full Name *</label>
                <Input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Customer Full Name"
                  className="rounded-xl border-slate-200 h-10 text-xs font-semibold focus-visible:border-indigo-500 text-slate-900 bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block pl-0.5">Mobile Contact *</label>
                <Input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="10-digit contact mobile..."
                  className="rounded-xl border-slate-200 h-10 text-xs font-semibold focus-visible:border-indigo-500 text-slate-900 bg-white"
                  required
                />
              </div>

              <div className="flex gap-2.5 mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 rounded-xl h-10 text-xs font-extrabold text-slate-600 border-slate-200 cursor-pointer shadow-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl h-10 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-600/10 transition-transform active:scale-95"
                >
                  Register Account
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── TRANSACTION APPROVED - REALISTIC THERMAL RECEIPT MODAL ── */}
      {billPreview && (() => {
        const inv = billPreview;
        const customer = inv.customer;
        const createdDate = new Date(inv.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        });
        const createdTime = new Date(inv.createdAt).toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit',
        });

        const handleWhatsApp = () => {
          const phone = (customer?.phone || '').replace(/[^0-9]/g, '');
          const formatted = phone.length === 10 ? `91${phone}` : phone;
          let shopName = "NexBill";
          try {
            const s = localStorage.getItem('shop');
            if (s) shopName = JSON.parse(s).name || shopName;
          } catch (_) {}

          const itemLines = (inv.items || [])
            .map((it) => `  • ${it.product?.name} × ${it.quantity}  →  ₹${(it.subtotal ?? 0).toFixed(0)}`)
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
            `*Total : ₹${inv.total.toFixed(0)}*\n` +
            `Payment : ${(inv.paymentMethod || '').toUpperCase()}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `View receipt: ${window.location.origin}/dashboard/billing/${inv._id}\n\n` +
            `Thank you! 🙏`;

          window.location.href = `whatsapp://send?phone=${formatted}&text=${encodeURIComponent(msg)}`;
        };

        const closeApprovalAndStartNew = () => {
          setBillPreview(null);
          clearActiveTabCart();
          if (barcodeInputRef.current) barcodeInputRef.current.focus();
        };

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col border border-slate-100 relative">
              
              {/* Approval Success Banner */}
              <div className="bg-emerald-600 p-5 text-white text-center space-y-2 shrink-0 select-none">
                <div className="size-11 bg-white/20 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="text-base font-black tracking-tight leading-none mt-1">Payment Successful!</h3>
                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                  Ticket #{inv.invoiceNumber} Approved
                </p>
              </div>

              {/* Realistic Paper Thermal Receipt Body */}
              <div className="bg-white px-6 py-5 flex-1 overflow-y-auto max-h-[50vh] relative select-text font-mono text-[11px] text-slate-800 leading-normal">
                
                {/* Decorative Jagged receipt top cuts */}
                <div className="absolute top-0 inset-x-0 h-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200/40 via-transparent to-transparent bg-repeat-x bg-[length:8px_4px]" />

                <div className="text-center space-y-1 mb-4 select-none">
                  <h4 className="font-black text-xs text-slate-900 tracking-wide">** NEXBILL RETAIL **</h4>
                  <p className="text-[10px] text-slate-400">Quick POS Receipt Slip</p>
                  <p className="text-[9.5px] text-slate-400">{createdDate} · {createdTime}</p>
                </div>

                <div className="border-t border-dashed border-slate-300 py-2.5 space-y-1">
                  <p className="font-bold"><span className="text-slate-400">Customer:</span> {customer?.name || 'Retail Guest'}</p>
                  {customer?.phone && <p className="font-bold"><span className="text-slate-400">Contact:</span> {customer.phone}</p>}
                  <p className="font-bold"><span className="text-slate-400">Method:</span> {inv.paymentMethod.toUpperCase()}</p>
                </div>

                {/* Items Lines */}
                <div className="border-t border-dashed border-slate-300 py-3 space-y-2.5">
                  <div className="flex justify-between font-black text-[9.5px] text-slate-400 select-none">
                    <span>ITEM DESCRIPTION</span>
                    <span>TOTAL</span>
                  </div>
                  
                  {(inv.items || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-black text-slate-900">{it.product?.name}</p>
                        <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">{it.quantity} Unit x ₹{it.price.toFixed(2)}</p>
                      </div>
                      <span className="font-extrabold text-slate-950">₹{(it.subtotal ?? 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="border-t border-dashed border-slate-300 py-3.5 space-y-1.5">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Basket Subtotal:</span>
                    <span>₹{(inv.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  {(inv.taxAmount ?? 0) > 0 && (
                    <div className="flex justify-between text-slate-500 font-bold">
                      <span>Tax (GST 18% Inc):</span>
                      <span>₹{(inv.taxAmount ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  {inv.discountAmount > 0 && (
                    <div className="flex justify-between text-red-500 font-black">
                      <span>Cash Discount:</span>
                      <span>-₹{inv.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-950 font-black text-xs border-t border-slate-200 pt-2 pb-1">
                    <span>NET AMOUNT Billed:</span>
                    <span>₹{inv.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-2 select-none">
                  {/* Authentic Barcode Graphic */}
                  <div className="mx-auto w-32 h-6 flex items-center justify-between opacity-35 bg-[linear-gradient(90deg,_#000_2px,_transparent_2px,_transparent_5px,_#000_5px,_#000_6px,_transparent_6px,_transparent_8px,_#000_8px,_#000_10px)] bg-repeat-x" />
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Thank you for shopping</p>
                </div>
              </div>

              {/* Operations Footer buttons */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2 shrink-0 select-none">
                <button
                  onClick={handleWhatsApp}
                  className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10.5px] font-black rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </button>
                <a
                  href={`/dashboard/billing/${inv._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-black rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Printer size={13} strokeWidth={2.5} />
                  Print Bill
                </a>
                <button
                  onClick={closeApprovalAndStartNew}
                  className="py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[10.5px] font-black rounded-xl transition-colors cursor-pointer text-center shadow-md active:scale-95"
                >
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
