'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Edit, Trash2, Phone, Mail, Users, Search,
  Star, Building, X, Receipt, ExternalLink, ShoppingBag,
  Calendar, Banknote, TrendingUp,
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  customerType: string;
  loyaltyPoints: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{ product?: { name: string }; quantity: number }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Purchase history drawer state
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `/api/customers${search ? `?search=${search}` : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setCustomers(data.data.customers);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openHistory = useCallback(async (customer: Customer) => {
    setActiveCustomer(customer);
    setInvoices([]);
    setInvoicesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/invoices?customerId=${customer._id}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setInvoices(data.data.invoices);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const closeHistory = () => {
    setActiveCustomer(null);
    setInvoices([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(customers.filter((c) => c._id !== id));
      if (activeCustomer?._id === id) closeHistory();
    } catch (err) {
      console.error('Error deleting customer:', err);
    }
  };

  const totalSpend = invoices.reduce((s, inv) => s + (inv.total || 0), 0);

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    if (s === 'unpaid') return 'bg-rose-50 text-rose-700 border-rose-200/50';
    return 'bg-amber-50 text-amber-700 border-amber-200/50';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-500 size-5" />
            Customers Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage wholesale buyers, retail shoppers, and POS loyalty rewards</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2 shadow-sm cursor-pointer">
            <Plus size={16} />
            Register Customer
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="p-5 border-slate-200/80 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search customers registry by name or mobile number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10.5 rounded-xl border-slate-200 text-xs placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white"
          />
        </div>
      </Card>

      {/* Listing */}
      {loading ? (
        <div className="text-center text-slate-500 font-medium py-12 text-xs uppercase tracking-widest animate-pulse">
          Retrieving customer index...
        </div>
      ) : customers.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-300">
          {search.trim() ? (
            <>
              <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="size-5 text-indigo-400" />
              </div>
              <p className="text-slate-800 font-bold text-sm">No customer found</p>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                &ldquo;<span className="font-semibold text-slate-700">{search}</span>&rdquo; is not in the registry yet
              </p>
              <Link
                href={`/dashboard/customers/new?${/^[0-9\s\-+()]{6,}$/.test(search.trim()) ? `phone=${encodeURIComponent(search.trim())}` : `name=${encodeURIComponent(search.trim())}`}`}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-5 h-10 gap-2 cursor-pointer">
                  <Plus size={14} />
                  Register &ldquo;{search}&rdquo;
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Users className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold text-sm">No registered customers</p>
              <p className="text-xs text-slate-500 mt-1 mb-6">Create profiles to track purchase details during checkout</p>
              <Link href="/dashboard/customers/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-4 cursor-pointer">
                  Register First Customer
                </Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <Card
              key={customer._id}
              onClick={() => openHistory(customer)}
              className={`p-6 border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer ${
                activeCustomer?._id === customer._id
                  ? 'border-indigo-400/60 ring-2 ring-indigo-500/15 bg-indigo-50/30'
                  : 'hover:border-indigo-500/20'
              }`}
            >
              <div>
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{customer.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {customer.customerType === 'retail' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[9px] uppercase tracking-wide border border-slate-200/20">
                          Retail Shopper
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[9px] uppercase tracking-wide border border-indigo-100/25">
                          <Building size={10} className="text-indigo-500" />
                          Wholesaler
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/40 text-[10px] font-black select-none shrink-0">
                    <Star size={11} className="fill-amber-500 stroke-amber-500" />
                    {customer.loyaltyPoints || 0} pts
                  </span>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 text-slate-400 rounded-lg">
                      <Phone size={13} />
                    </div>
                    <span className="font-semibold text-slate-700">{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-100 text-slate-400 rounded-lg">
                        <Mail size={13} />
                      </div>
                      <span className="font-medium text-slate-500 truncate">{customer.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex gap-2.5 border-t border-slate-100 pt-4" onClick={(e) => e.stopPropagation()}>
                <Link href={`/dashboard/customers/${customer._id}`} className="flex-1">
                  <Button variant="outline" className="w-full text-xs font-semibold rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 gap-1.5 h-9.5 cursor-pointer">
                    <Edit size={14} className="text-slate-400" />
                    Edit Profile
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(customer._id)}
                  className="size-9.5 p-0 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/30 hover:border-red-500/20 cursor-pointer"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Purchase History Drawer (slide-in from right) ── */}
      {/* Backdrop */}
      {activeCustomer && (
        <div
          className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40"
          onClick={closeHistory}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          activeCustomer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {activeCustomer && (
          <>
            {/* Drawer header */}
            <div className="flex items-start gap-4 px-6 py-5 border-b border-slate-100 shrink-0">
              {/* Avatar */}
              <div className="size-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0 select-none">
                {activeCustomer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black text-slate-900 leading-tight truncate">{activeCustomer.name}</h2>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={10} />{activeCustomer.phone}
                </p>
              </div>
              <button
                onClick={closeHistory}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Summary stats bar */}
            {!invoicesLoading && invoices.length > 0 && (
              <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Orders</p>
                  <p className="text-lg font-black text-slate-900">{invoices.length}</p>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Spend</p>
                  <p className="text-lg font-black text-indigo-600">₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Loyalty Pts</p>
                  <p className="text-lg font-black text-amber-600">{activeCustomer.loyaltyPoints || 0}</p>
                </div>
              </div>
            )}

            {/* Section label */}
            <div className="px-6 pt-4 pb-2 shrink-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingBag size={12} /> Purchase History
              </p>
            </div>

            {/* Invoice list — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
              {invoicesLoading ? (
                /* Loading skeleton */
                <div className="space-y-3 animate-pulse">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
                  ))}
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <Receipt size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No purchases yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {activeCustomer.name.split(' ')[0]}&apos;s orders will appear here
                  </p>
                  <Link href="/dashboard/billing/new" className="mt-5">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl px-4 h-9 gap-1.5 cursor-pointer">
                      <Plus size={13} />
                      New Invoice
                    </Button>
                  </Link>
                </div>
              ) : (
                invoices.map((inv) => {
                  const date = new Date(inv.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  const itemCount = inv.items?.reduce((s, it) => s + it.quantity, 0) || 0;
                  const firstItem = inv.items?.[0]?.product?.name || 'Items';

                  return (
                    <div
                      key={inv._id}
                      className="group flex items-center gap-4 p-4 bg-white border border-slate-100 hover:border-indigo-200/60 rounded-2xl hover:shadow-sm transition-all duration-200"
                    >
                      {/* Left — icon */}
                      <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                        <Receipt size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>

                      {/* Middle — info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-xs font-black text-slate-900 font-mono">{inv.invoiceNumber}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${statusColor(inv.paymentStatus)}`}>
                            {inv.paymentStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {firstItem}{itemCount > 1 ? ` + ${itemCount - 1} more` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Calendar size={9} />{date}</span>
                          <span className="flex items-center gap-1"><Banknote size={9} />{(inv.paymentMethod || 'cash').toUpperCase()}</span>
                        </div>
                      </div>

                      {/* Right — total + link */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-slate-900">₹{(inv.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <Link
                          href={`/dashboard/billing/${inv._id}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 mt-1 transition-colors"
                        >
                          View <ExternalLink size={9} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer footer */}
            {!invoicesLoading && invoices.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <TrendingUp size={13} className="text-emerald-500" />
                  <span>{invoices.filter(i => i.paymentStatus === 'paid').length} paid · {invoices.filter(i => i.paymentStatus !== 'paid').length} pending</span>
                </div>
                <Link href="/dashboard/billing/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-8 px-3 gap-1.5 cursor-pointer">
                    <Plus size={12} />
                    New Invoice
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
