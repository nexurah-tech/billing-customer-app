'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus, Eye, Calendar, Receipt, Banknote, ShieldAlert,
  Sparkles, MessageCircle, IndianRupee, CheckCircle2,
  Clock, CreditCard, QrCode, ChevronLeft, ChevronRight,
  UserCircle2,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: { name: string; phone: string };
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => { fetchInvoices(page); }, [page]);

  const fetchInvoices = async (pageNumber: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/invoices?page=${pageNumber}&limit=${pageSize}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data.invoices);
        setTotalPages(data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':    return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', icon: <CheckCircle2 size={11} />, label: 'Paid' };
      case 'unpaid':  return { cls: 'bg-rose-50 text-rose-700 border-rose-200/60',       icon: <ShieldAlert size={11} />,   label: 'Unpaid' };
      case 'partial': return { cls: 'bg-amber-50 text-amber-700 border-amber-200/60',    icon: <Clock size={11} />,          label: 'Partial' };
      default:        return { cls: 'bg-slate-50 text-slate-700 border-slate-200/60',    icon: null,                         label: status };
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':   return <CreditCard size={12} className="text-slate-400" />;
      case 'online': return <QrCode size={12} className="text-slate-400" />;
      default:       return <Banknote size={12} className="text-slate-400" />;
    }
  };

  const handleShareWhatsApp = (invoice: Invoice) => {
    if (!invoice.customer?.phone) { alert('No phone number for this customer.'); return; }
    const phone = invoice.customer.phone.replace(/[^0-9]/g, '');
    const formatted = phone.length === 10 ? `91${phone}` : phone;
    let shopName = 'NexBill';
    try { const s = localStorage.getItem('shop'); if (s) shopName = JSON.parse(s).name || shopName; } catch (_) {}
    const date = new Date(invoice.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    const msg = `Hello *${invoice.customer.name}*,\n\nThank you for shopping at *${shopName}*!\n\nInvoice *${invoice.invoiceNumber}*\nDate: ${date}\nTotal: *₹${invoice.total.toFixed(2)}*\nStatus: *${invoice.paymentStatus.toUpperCase()}*\n\nView receipt: ${window.location.origin}/dashboard/billing/${invoice._id}\n\nThank you! 🙏`;
    window.location.href = `whatsapp://send?phone=${formatted}&text=${encodeURIComponent(msg)}`;
  };

  const totalPaid    = invoices.filter(i => i.paymentStatus === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending = invoices.filter(i => i.paymentStatus !== 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Receipt className="text-white size-4.5" />
            </div>
            Billing Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Audit published invoices, payment statuses, and transaction details
          </p>
        </div>
        <Link href="/dashboard/billing/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 font-bold text-xs gap-2 shadow-sm cursor-pointer">
            <Plus size={15} />
            New Invoice POS
          </Button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Settled Cash */}
          <Card className="p-5 flex flex-col gap-2 border-l-4 border-l-emerald-500 border-y border-r border-slate-200/80 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 bg-white rounded-xl relative overflow-hidden group min-h-[110px]">
            <Banknote className="absolute -bottom-3 -right-3 text-emerald-100/80 group-hover:text-emerald-200/60 transition-colors duration-500" style={{ width: 72, height: 72 }} strokeWidth={1.2} />
            <div className="flex items-center justify-between z-10">
              <span className="text-[13px] font-bold text-slate-600 tracking-tight">Settled Cash</span>
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                <Banknote size={14} />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight text-slate-900 leading-none z-10 flex items-start gap-0.5">
              <IndianRupee size={18} className="text-slate-600 mt-1.5" strokeWidth={2.5} />
              {totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-bold mt-auto bg-emerald-50 border border-emerald-200/50 w-fit px-2.5 py-1 rounded-lg z-10">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
              Paid &amp; Collected
            </div>
          </Card>

          {/* Pending Balances */}
          <Card className="p-5 flex flex-col gap-2 border-l-4 border-l-amber-500 border-y border-r border-slate-200/80 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 bg-white rounded-xl relative overflow-hidden group min-h-[110px]">
            <ShieldAlert className="absolute -bottom-3 -right-3 text-amber-100/80 group-hover:text-amber-200/60 transition-colors duration-500" style={{ width: 72, height: 72 }} strokeWidth={1.2} />
            <div className="flex items-center justify-between z-10">
              <span className="text-[13px] font-bold text-slate-600 tracking-tight">Pending Balances</span>
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/50">
                <ShieldAlert size={14} />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight text-slate-900 leading-none z-10 flex items-start gap-0.5">
              <IndianRupee size={18} className="text-slate-600 mt-1.5" strokeWidth={2.5} />
              {totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-bold mt-auto bg-amber-50 border border-amber-200/50 w-fit px-2.5 py-1 rounded-lg z-10">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" /></span>
              Outstanding
            </div>
          </Card>

          {/* Invoice Count */}
          <Card className="p-5 flex flex-col gap-2 border-l-4 border-l-indigo-500 border-y border-r border-slate-200/80 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 bg-white rounded-xl relative overflow-hidden group min-h-[110px]">
            <Receipt className="absolute -bottom-3 -right-3 text-indigo-100/80 group-hover:text-indigo-200/60 transition-colors duration-500" style={{ width: 72, height: 72 }} strokeWidth={1.2} />
            <div className="flex items-center justify-between z-10">
              <span className="text-[13px] font-bold text-slate-600 tracking-tight">Audit Count</span>
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50">
                <Receipt size={14} />
              </div>
            </div>
            <div className="text-3xl font-black tracking-tight text-slate-900 leading-none z-10">
              {invoices.length} <span className="text-base font-semibold text-slate-400">invoices</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 font-bold mt-auto bg-indigo-50 border border-indigo-200/50 w-fit px-2.5 py-1 rounded-lg z-10">
              <Sparkles size={11} className="text-indigo-400" />
              Processed
            </div>
          </Card>
        </div>
      )}

      {/* ── Table / States ── */}
      {loading ? (
        <div className="text-center text-slate-400 font-semibold py-16 text-xs uppercase tracking-widest animate-pulse">
          Retrieving ledger...
        </div>
      ) : invoices.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-slate-300 rounded-2xl">
          <Receipt className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm">No ledger operations logged</p>
          <p className="text-xs text-slate-400 mt-1 mb-6">Launch POS terminal to publish your first invoice</p>
          <Link href="/dashboard/billing/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-5 cursor-pointer">
              Launch POS Terminal
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              {/* ── Head ── */}
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Receipt ID
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total Bill
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Payment
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ── Body ── */}
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => {
                  const status = getStatusConfig(invoice.paymentStatus);
                  return (
                    <tr key={invoice._id} className="group hover:bg-indigo-50/30 transition-colors duration-150">

                      {/* Invoice number badge */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                          <Receipt size={10} className="text-indigo-400" />
                          {invoice.invoiceNumber}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {invoice.customer?.name
                              ? invoice.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                              : 'RG'}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-tight">
                              {invoice.customer?.name || 'Retail Guest'}
                            </p>
                            {invoice.customer?.phone && (
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                {invoice.customer.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5">
                        <span className="text-[14px] font-black text-slate-900 flex items-center gap-0.5">
                          <IndianRupee size={12} className="text-slate-500" strokeWidth={2.5} />
                          {invoice.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </td>

                      {/* Payment method */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded-lg capitalize">
                          {getMethodIcon(invoice.paymentMethod)}
                          {invoice.paymentMethod || 'cash'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide select-none ${status.cls}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-600">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(invoice.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            onClick={() => handleShareWhatsApp(invoice)}
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200/50 hover:border-emerald-200 cursor-pointer transition-all"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </Button>
                          <Link href={`/dashboard/billing/${invoice._id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/50 hover:border-indigo-200 cursor-pointer transition-all"
                              title="View Invoice"
                            >
                              <Eye size={14} />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer + Pagination */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-semibold">
              Page {page} of {totalPages} &nbsp;·&nbsp; {invoices.length} records shown
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-[11px] font-bold text-slate-600 px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg min-w-[32px] text-center">
                {page}
              </span>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg border border-slate-200/60 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
