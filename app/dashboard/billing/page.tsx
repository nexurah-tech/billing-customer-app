'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Calendar, User, Receipt, Banknote, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  total: number;
  paymentStatus: string;
  createdAt: string;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/invoices', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setInvoices(data.data.invoices);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'unpaid':
        return 'bg-rose-50 text-rose-700 border-rose-200/50';
      case 'partial':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/50';
    }
  };

  const handleShareWhatsApp = (invoice: Invoice) => {
    if (!invoice.customer || !invoice.customer.phone) {
      alert('No customer phone number registered for this invoice.');
      return;
    }
    const phone = invoice.customer.phone.replace(/[^0-9]/g, '');
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    
    const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    let shopName = 'Nexurah BillEase';
    try {
      const shopData = localStorage.getItem('shop');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        shopName = parsed.name || 'Nexurah BillEase';
      }
    } catch (err) {
      console.error(err);
    }
    
    const message = `Hello *${invoice.customer.name || 'Nexurah Customer'}*,\n\n` +
      `Thanks for shopping with us at *${shopName}*!\n\n` +
      `Here is a summary of your invoice *${invoice.invoiceNumber}*:\n` +
      `----------------------------\n` +
      `• Date: ${formattedDate}\n` +
      `• Grand Total: *₹${invoice.total.toFixed(2)}*\n` +
      `• Payment Status: *${invoice.paymentStatus.toUpperCase()}*\n` +
      `----------------------------\n\n` +
      `View/Print full receipt:\n${window.location.origin}/dashboard/billing/${invoice._id}\n\n` +
      `Thank you for your business!`;
      
    const encodedMessage = encodeURIComponent(message);
    const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    window.location.href = waUrl;
  };

  // Compute live statistics from the list
  const totalPaid = invoices
    .filter((inv) => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalPending = invoices
    .filter((inv) => inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partial')
    .reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-indigo-500 size-5.5" />
            Billing Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit published customer invoices, payment statuses, and transaction details</p>
        </div>

        <Link href="/dashboard/billing/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2 shadow-sm cursor-pointer animate-in fade-in slide-in-from-right-4 duration-300">
            <Plus size={16} />
            New Invoice POS
          </Button>
        </Link>
      </div>

      {/* Ledger Stats Deck */}
      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Settled Cash */}
          <Card className="p-5 border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
              <Banknote size={50} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Settled Cash</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                ₹{totalPaid.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/40 px-2 py-0.5 rounded-full font-bold select-none">
              Paid Sum
            </span>
          </Card>

          {/* Pending Collectibles */}
          <Card className="p-5 border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 text-amber-600 transition-transform duration-300 group-hover:scale-110">
              <ShieldAlert size={50} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Balances</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                ₹{totalPending.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/40 px-2 py-0.5 rounded-full font-bold select-none">
              Outstanding
            </span>
          </Card>

          {/* Total transactions */}
          <Card className="p-5 border-slate-200/80 shadow-2xs flex items-center justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 text-indigo-600 transition-transform duration-300 group-hover:scale-110">
              <Receipt size={50} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit Count</p>
              <h3 className="text-lg font-black text-slate-900 mt-1">{invoices.length} invoices</h3>
            </div>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100/40 px-2 py-0.5 rounded-full font-bold select-none">
              Processed
            </span>
          </Card>
        </div>
      )}

      {/* Listing state */}
      {loading ? (
        <div className="text-center text-slate-500 font-medium py-12 text-xs uppercase tracking-widest animate-pulse">
          Retrieving ledger...
        </div>
      ) : invoices.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-slate-300">
          <Receipt className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm">No ledger operations logged</p>
          <p className="text-xs text-slate-500 mt-1 mb-6">Launch POS terminal to publish your first invoice</p>
          <Link href="/dashboard/billing/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-4 cursor-pointer">
              Launch POS Terminal
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200/80 shadow-2xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Receipt ID
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Total bill
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        {invoice.customer?.name || 'Retail Guest'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-slate-950">
                      ₹
                      {invoice.total.toLocaleString('en-IN', {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center border px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider select-none ${getStatusColor(
                          invoice.paymentStatus
                        )}`}
                      >
                        {invoice.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(invoice.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          onClick={() => handleShareWhatsApp(invoice)}
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border border-slate-200/30 hover:border-emerald-500/20 cursor-pointer transition-colors duration-200"
                          title="Share on WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </Button>
                        <Link href={`/dashboard/billing/${invoice._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/30 hover:border-indigo-500/20 cursor-pointer transition-colors duration-200"
                            title="View Invoice"
                          >
                            <Eye size={14} />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

