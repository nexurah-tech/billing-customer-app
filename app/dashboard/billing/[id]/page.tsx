'use client';

import { useEffect, useState, use } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, ArrowLeft, FileText, Calendar, User, ShoppingBag, CreditCard, Receipt, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import apiFetch from '@/lib/apiClient';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  items: Array<{
    product: {
      name: string;
      sku: string;
      unit?: string;
    };
    quantity: number;
    price: number;
    tax: number;
    subtotal: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
  createdAt: string;
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [shopName, setShopName] = useState("NexBill");
  const [shopAddress, setShopAddress] = useState('POS Terminal Branch #1');

  useEffect(() => {
    fetchInvoice();
    try {
      const shopData = localStorage.getItem('shop');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        setShopName(parsed.name || "NexBill");
        setShopAddress(parsed.address || 'POS Terminal Branch #1');
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setInvoice(data.data);
    } catch (err) {
      console.error('Error fetching invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const shareOnWhatsApp = () => {
    if (!invoice) return;
    const phone = invoice.customer.phone.replace(/[^0-9]/g, '');
    const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
    
    const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    
    const totalItems = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
    
    const message = `Hello *${invoice.customer.name}*,\n\n` +
      `Thanks for shopping with us at *${shopName}*!\n\n` +
      `Here is a summary of your invoice *${invoice.invoiceNumber}*:\n` +
      `----------------------------\n` +
      `• Date: ${formattedDate}\n` +
      `• Items: ${totalItems} units\n` +
      `• Grand Total: *₹${invoice.total.toFixed(2)}*\n` +
      `• Payment Method: ${invoice.paymentMethod.toUpperCase()}\n` +
      `• Payment Status: *${invoice.paymentStatus.toUpperCase()}*\n` +
      `----------------------------\n\n` +
      `View/Print full receipt:\n${window.location.href}\n\n` +
      `Thank you for your business!`;
      
    const encodedMessage = encodeURIComponent(message);
    
    const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
    window.location.href = waUrl;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500 font-medium animate-pulse text-xs uppercase tracking-widest py-10">
          Loading receipt details...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 py-16">
        <p className="text-slate-700 font-semibold">Invoice receipt not found</p>
        <Link href="/dashboard/billing">
          <Button className="bg-indigo-600">Back to Billing list</Button>
        </Link>
      </div>
    );
  }

  const getStatusStampColors = (status: string) => {
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

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 print:hidden select-none">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/billing">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-slate-200 h-9 w-9 text-slate-600 hover:text-slate-900 cursor-pointer">
              <ArrowLeft size={15} />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              Invoice Receipt
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Receipt ID: {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={shareOnWhatsApp}
            className="bg-emerald-605 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-9 px-3.5 font-bold text-xs gap-1.5 shadow-sm cursor-pointer animate-in fade-in slide-in-from-right-3 duration-300">
            <MessageCircle size={14} />
            Share WhatsApp
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-3.5 font-bold text-xs gap-1.5 shadow-sm cursor-pointer">
            <Printer size={14} />
            Print Receipt
          </Button>
        </div>
      </div>

      {/* Styled Printable Receipt Paper */}
      <Card className="p-5 sm:p-6 md:p-8 bg-white border border-slate-200/80 shadow-md relative overflow-hidden rounded-2xl">
        {/* Decorative Top Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-indigo-600" />

        {/* Receipt Header Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start mb-5 select-none">
          {/* Shop branding metadata */}
          <div>
            <h2 className="text-base font-black text-slate-950 flex items-center gap-2">
              <Receipt className="text-indigo-600 size-4.5" />
              {shopName}
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
              {shopAddress}
            </p>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5 font-semibold uppercase tracking-wider">
              Retail POS Invoice
            </p>
          </div>

          {/* Status stamp overlay */}
          <div className="sm:text-right flex flex-col sm:items-end gap-1.5">
            <span
              className={`inline-flex items-center justify-center border px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider select-none ${getStatusStampColors(invoice.paymentStatus)}`}>
              {invoice.paymentStatus}
            </span>
            <p className="text-[9px] text-slate-400 font-mono">
              Method:{" "}
              <span className="font-bold text-slate-800 capitalize">
                {invoice.paymentMethod}
              </span>
            </p>
          </div>
        </div>

        {/* Dash Perforated Separation line */}
        <hr className="border-t border-dashed border-slate-200 my-4" />

        {/* Invoice details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 select-none">
          {/* Left Metadata */}
          <div className="space-y-2.5">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText size={11} className="text-indigo-500" />
              INVOICE RECORD
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-semibold">
                  Receipt No
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="text-[8px] text-slate-400 uppercase font-semibold">
                  Date
                </p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Right Customer info */}
          <div className="space-y-2.5">
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <User size={11} className="text-indigo-500" />
              BILL TO CUSTOMER
            </h3>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {invoice.customer.name}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Phone: {invoice.customer.phone}
              </p>
              {invoice.customer.email && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Email: {invoice.customer.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table — scrollable when many items */}
        <div className="mb-5 overflow-hidden rounded-xl border border-slate-100 select-none">
          <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Product Description
                  </th>
                  <th className="px-3 py-2 text-center text-[9px] font-bold text-slate-500 uppercase tracking-wider w-16">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider w-24">
                    Unit Price
                  </th>
                  <th className="px-3 py-2 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider w-24">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-2 text-xs text-slate-900">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShoppingBag size={11} className="text-slate-400" />
                        {item.product.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5 pl-4.5">
                        {item.product.sku}
                      </p>
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold text-slate-950">
                      {item.quantity} {item.product.unit || 'pcs'}
                    </td>
                    <td className="px-3 py-2 text-right text-xs text-slate-600 font-medium">
                      ₹{item.price.toFixed(2)} / {item.product.unit || 'pcs'}
                    </td>
                    <td className="px-3 py-2 text-right text-xs font-black text-slate-900">
                      ₹{item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Item count footer */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              {invoice.items.length} line item{invoice.items.length !== 1 ? 's' : ''}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Quantity: {invoice.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
        </div>

        {/* Totals Box Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2 select-none">
          <div className="sm:col-span-6 flex flex-col justify-end">
            {invoice.notes && (
              <div className="p-3 bg-slate-50 border border-slate-200/40 rounded-xl max-w-xs">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  Receipt Notes
                </p>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {invoice.notes}
                </p>
              </div>
            )}
          </div>

          <div className="sm:col-span-6 space-y-1.5 border-t sm:border-t-0 sm:pt-0 pt-3 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-slate-800">
                ₹{invoice.subtotal.toFixed(2)}
              </span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-red-500 font-bold">
                <span>Loyalty Discount:</span>
                <span>-₹{invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
              <span className="text-slate-900 font-extrabold text-xs">
                Grand Total:
              </span>
              <span className="text-lg font-black text-indigo-600 tracking-tight">
                ₹{invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Premium Perforated Tear line and Barcode Stamp */}
        <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center select-none space-y-3">
          {/* Mock premium POS barcode */}
          <div className="flex flex-col items-center justify-center gap-1 opacity-75 print:opacity-100">
            <div className="flex items-center gap-[1.5px] h-7 bg-white">
              {[
                2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 2, 1, 4, 1,
                2, 1, 3, 2,
              ].map((w, i) => (
                <div
                  key={i}
                  className="h-full bg-slate-900"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
            <p className="text-[7.5px] font-mono tracking-widest uppercase text-slate-500 font-bold">
              *{invoice.invoiceNumber}*
            </p>
          </div>

          <div>
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
              Thank you for shopping with us!
            </p>
            <p className="text-[7.5px] text-slate-400 mt-0.5">
              Generated by NexBill Cloud POS Terminal
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

