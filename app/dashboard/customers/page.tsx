'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Edit, Trash2, Phone, Mail, Users, Search,
  Star, Building, X, Receipt, ExternalLink, ShoppingBag,
  Calendar, Banknote, TrendingUp, UserCircle2, ChevronRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

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
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  useEffect(() => { fetchCustomers(); }, [search]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `/api/customers${search ? `?search=${search}` : ''}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
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
      const res = await apiFetch(`/api/invoices?customerId=${customer._id}&limit=50`, {
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

  const closeHistory = () => { setActiveCustomer(null); setInvoices([]); };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      const token = localStorage.getItem('token');
      await apiFetch(`/api/customers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setCustomers(customers.filter((c) => c._id !== id));
      if (activeCustomer?._id === id) closeHistory();
    } catch (err) { console.error('Error deleting customer:', err); }
  };

  const totalSpend = invoices.reduce((s, inv) => s + (inv.total || 0), 0);

  const statusColor = (s: string) => {
    if (s === 'paid') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    if (s === 'unpaid') return 'bg-rose-50 text-rose-700 border-rose-200/60';
    return 'bg-amber-50 text-amber-700 border-amber-200/60';
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Users className="text-white size-4.5" />
            </div>
            Customers Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Manage wholesale buyers, retail shoppers, and POS loyalty rewards
          </p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 font-bold text-xs gap-2 shadow-sm cursor-pointer">
            <Plus size={15} />
            Register Customer
          </Button>
        </Link>
      </div>

      {/* ── Search + Count ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search by name or mobile number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-slate-200 text-sm placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white"
          />
        </div>
        {!loading && (
          <span className="shrink-0 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-3.5 py-2 rounded-xl">
            {customers.length} customer{customers.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── States ── */}
      {loading ? (
        <div className="text-center text-slate-400 font-semibold py-16 text-xs uppercase tracking-widest animate-pulse">
          Loading registry...
        </div>
      ) : customers.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-slate-300 rounded-2xl">
          {search.trim() ? (
            <>
              <div className="size-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="size-5 text-indigo-400" />
              </div>
              <p className="text-slate-800 font-bold text-sm">No customer found</p>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                &ldquo;<span className="font-semibold text-slate-600">{search}</span>&rdquo; is not in the registry
              </p>
              <Link href={`/dashboard/customers/new?${/^[0-9\s\-+()]{6,}$/.test(search.trim()) ? `phone=${encodeURIComponent(search.trim())}` : `name=${encodeURIComponent(search.trim())}`}`}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-5 h-10 gap-2 cursor-pointer">
                  <Plus size={14} /> Register &ldquo;{search}&rdquo;
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Users className="size-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold text-sm">No registered customers</p>
              <p className="text-xs text-slate-400 mt-1 mb-6">Create profiles to track purchase history</p>
              <Link href="/dashboard/customers/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-5 cursor-pointer">
                  Register First Customer
                </Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              {/* ── Head ── */}
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Contact
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Loyalty Points
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    onClick={() => openHistory(customer)}
                    className={`group transition-colors duration-150 cursor-pointer ${
                      activeCustomer?._id === customer._id
                        ? 'bg-indigo-50/60 border-l-2 border-l-indigo-500'
                        : 'hover:bg-indigo-50/30'
                    }`}
                  >
                    {/* Avatar + Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 leading-tight">
                            {customer.name}
                          </p>
                          {customer.email && (
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[160px]">
                              {customer.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700">
                        <Phone size={12} className="text-slate-400" />
                        {customer.phone}
                      </span>
                    </td>

                    {/* Customer type */}
                    <td className="px-5 py-3.5">
                      {customer.customerType === 'retail' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-slate-700 text-[11px] font-semibold">
                          <UserCircle2 size={11} className="text-slate-400" />
                          Retail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold">
                          <Building size={11} className="text-indigo-400" />
                          Wholesale
                        </span>
                      )}
                    </td>

                    {/* Loyalty */}
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/50 text-amber-700 text-[12px] font-bold">
                        <Star size={11} className="fill-amber-500 stroke-amber-500" />
                        {customer.loyaltyPoints || 0} pts
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/dashboard/customers/${customer._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/50 hover:border-indigo-200 cursor-pointer transition-all"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer._id)}
                          className="size-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/50 hover:border-red-200 cursor-pointer transition-all"
                        >
                          <Trash2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openHistory(customer)}
                          className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/50 cursor-pointer transition-all"
                        >
                          <ChevronRight size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-semibold">{customers.length} total customers</p>
            <p className="text-[11px] text-slate-400 font-semibold">Click a row to view purchase history</p>
          </div>
        </Card>
      )}

      {/* ── Purchase History Drawer ── */}
      {activeCustomer && (
        <div className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" onClick={closeHistory} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          activeCustomer ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {activeCustomer && (
          <>
            {/* Drawer header */}
            <div className="bg-slate-900 px-6 py-5 shrink-0">
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {getInitials(activeCustomer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-white leading-tight truncate">{activeCustomer.name}</h2>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone size={10} />{activeCustomer.phone}
                  </p>
                </div>
                <button
                  onClick={closeHistory}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Stats inline in header */}
              {!invoicesLoading && invoices.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Orders</p>
                    <p className="text-xl font-black text-white mt-0.5">{invoices.length}</p>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Total Spend</p>
                    <p className="text-xl font-black text-indigo-400 mt-0.5">₹{totalSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Loyalty</p>
                    <p className="text-xl font-black text-amber-400 mt-0.5">{activeCustomer.loyaltyPoints || 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section label */}
            <div className="px-6 pt-4 pb-2 shrink-0 border-b border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingBag size={12} /> Purchase History
              </p>
            </div>

            {/* Invoice list — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
              {invoicesLoading ? (
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
                      <Plus size={13} /> New Invoice
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
                      className="group flex items-center gap-3.5 p-4 bg-white border border-slate-100 hover:border-indigo-200/60 rounded-xl hover:shadow-sm transition-all duration-200"
                    >
                      <div className="size-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                        <Receipt size={15} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[12px] font-black text-slate-900 font-mono">{inv.invoiceNumber}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${statusColor(inv.paymentStatus)}`}>
                            {inv.paymentStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {firstItem}{itemCount > 1 ? ` + ${itemCount - 1} more` : ''}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-0.5"><Calendar size={9} />{date}</span>
                          <span className="flex items-center gap-0.5"><Banknote size={9} />{(inv.paymentMethod || 'cash').toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-black text-slate-900">₹{(inv.total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                        <Link
                          href={`/dashboard/billing/${inv._id}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 mt-0.5 transition-colors"
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
              <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <TrendingUp size={13} className="text-emerald-500" />
                  {invoices.filter(i => i.paymentStatus === 'paid').length} paid · {invoices.filter(i => i.paymentStatus !== 'paid').length} pending
                </div>
                <Link href="/dashboard/billing/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl h-8 px-3 gap-1.5 cursor-pointer">
                    <Plus size={12} /> New Invoice
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
