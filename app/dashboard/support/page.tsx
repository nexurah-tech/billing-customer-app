'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  HelpCircle, MessageSquare, Mail, AlertTriangle, ShieldCheck, Laptop, 
  ChevronDown, ChevronUp, RefreshCw, Globe, CheckCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I renew my monthly subscription?",
    answer: "Go to 'Settings' in the left sidebar menu and click 'Pay Renewal Fee' under 'Subscription & Billing'. Scan the UPI QR code to transfer the fee, and click 'Send Screenshot via WhatsApp' to share the payment details/receipt with the administrator for instant activation."
  },
  {
    question: "Can I use NexBill in offline mode?",
    answer: "Yes! NexBill features advanced local cache structures. When your connection drops, the top navigation signal strength turns red ('Offline') and the POS cashier system is updated to Offline Mode. You can keep checking out customer carts. All local records will automatically synchronize back to the database as soon as the connection is restored."
  },
  {
    question: "How do I add a new customer or product category?",
    answer: "For new products, go to 'Products Catalogue' -> 'New Product' and select or create categories. For customer registries, go to 'Customers Registry' and click 'New Profile'. You can also register walk-in guest profiles directly inside the Quick POS screen."
  },
  {
    question: "How can I reprint a customer's receipt or view past bills?",
    answer: "Navigate to 'Billing History' in the sidebar menu. Use the search bar to locate the invoice by invoice number, date, or customer name/phone. Click the print action icon next to the invoice details to reprint the receipt."
  },
  {
    question: "Can I hold a cart/ticket if a customer wants to get more items?",
    answer: "Yes! While in the Quick Bill screen, you can use the 'Hold Cart' option or press the keyboard shortcut (F4 or Alt+N). This saves the current items to local memory, allowing you to checkout other customers. You can retrieve the held cart from the 'Held Bills' panel to finish the transaction."
  },
  {
    question: "How do I download or export my sales and inventory reports?",
    answer: "Go to the 'Store Inventory' or 'Sales Analytics' pages. Click on the 'Export Excel' or 'Export PDF' buttons at the top of the tables. This compiles your current inventory records or date-filtered sales logs into a clean spreadsheet for tax filing and stock auditing."
  },
  {
    question: "What should I do if my barcode scanner isn't adding items?",
    answer: "Make sure your cursor is focused in the product search or barcode entry field on the billing screen. Since barcode scanners emulate keyboard typing, they require the search input field to be selected in order to automatically load and insert scanned SKU details."
  }
];

export default function SupportPage() {
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(0);
  const [shopName, setShopName] = useState('NexBill Terminal');
  const [shopEmail, setShopEmail] = useState('cashier@terminal.com');
  const [isOffline, setIsOffline] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [refreshDiagnostics, setRefreshDiagnostics] = useState(false);

  useEffect(() => {
    // Client-side local storage and agent retrieval
    if (typeof window !== 'undefined') {
      const shopData = localStorage.getItem('shop');
      if (shopData) {
        try {
          const parsed = JSON.parse(shopData);
          setShopName(parsed.name || 'NexBill Terminal');
          setShopEmail(parsed.email || 'cashier@terminal.com');
        } catch {}
      }
      setUserAgent(navigator.userAgent);
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [refreshDiagnostics]);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleRefreshDiagnostics = () => {
    setRefreshDiagnostics(!refreshDiagnostics);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/[0.015] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-500/[0.015] rounded-full blur-[100px] pointer-events-none" />

      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 relative z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="text-indigo-500 size-6" />
            Help & Support Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access guides, contact billing support, and view terminal diagnostics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: Contact support channels and diagnostics */}
        <div className="md:col-span-5 space-y-6">
          
          {/* WhatsApp direct support widget */}
          <Card className="p-5 border-emerald-200/60 bg-emerald-50/[0.15] shadow-xs space-y-4 rounded-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-28 bg-emerald-500/[0.04] rounded-full blur-lg" />
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider">WhatsApp Support</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Automated Helpdesk Channel</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              Get instant support on invoice modifications, terminal settings, or plan upgrades by sharing details on our WhatsApp support desk.
            </p>

            <a
              href="https://wa.me/919600950190?text=Hi%20NexBill%20Support,%20I%20need%20help%20with%20my%20billing%20terminal."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white text-xs font-black rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98 text-center flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              <MessageSquare size={13} strokeWidth={2.5} />
              Chat on WhatsApp (+91 96009 50190)
            </a>
          </Card>

          {/* Email Support Card */}
          <Card className="p-5 border-slate-200/80 shadow-xs space-y-3.5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/40">
                <Mail size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Helpdesk</h4>
                <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">contact@nexurah.in</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              For security modifications, email address updates, or general feedback, raise a ticket at our tech desk.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href="mailto:contact@nexurah.in"
                className="py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/60 rounded-xl text-xs text-slate-700 font-bold transition-all text-center cursor-pointer select-none block"
              >
                Mail contact@nexurah.in
              </a>
              <a
                href="mailto:nexurah@gmail.com"
                className="text-[10px] text-indigo-600 hover:underline font-bold text-center"
              >
                Alternate: nexurah@gmail.com
              </a>
            </div>
          </Card>

          {/* Diagnostics Widget */}
          <Card className="p-5 border-slate-200/80 shadow-xs space-y-3.5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Laptop size={12} /> Terminal Diagnostics
              </h4>
              <button
                onClick={handleRefreshDiagnostics}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                title="Refresh stats"
              >
                <RefreshCw size={11} />
              </button>
            </div>
            
            <div className="space-y-2.5 font-mono text-[10px] text-slate-600">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400">Terminal ID</span>
                <span className="text-slate-800 font-bold truncate max-w-[120px]">{shopName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400">Cache Account</span>
                <span className="text-slate-800 font-bold truncate max-w-[120px]">{shopEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400">Client Status</span>
                {isOffline ? (
                  <span className="text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                    <AlertTriangle size={8.5} /> Offline
                  </span>
                ) : (
                  <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                    <CheckCircle size={8.5} /> Online
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400">SSL Encrypted</span>
                <span className="text-indigo-650 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded font-black flex items-center gap-1 select-none">
                  <ShieldCheck size={9} /> AES-256
                </span>
              </div>
              <div className="space-y-1 pt-1.5 border-t border-slate-100">
                <span className="font-bold text-slate-400 flex items-center gap-1"><Globe size={10} /> User Agent String:</span>
                <p className="text-[8.5px] leading-normal text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2 max-h-16 overflow-y-auto break-all font-semibold">
                  {userAgent || "Unknown Browser Agent"}
                </p>
              </div>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: FAQs and terminal instructions */}
        <div className="md:col-span-7 space-y-5">
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-black text-slate-850 uppercase tracking-wider">Frequently Asked Questions</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">Answers to common cashier and billing terminal operations</p>
            </div>

            <div className="space-y-2.5 divide-y divide-slate-100">
              {FAQ_DATA.map((faq, index) => {
                const isOpen = openFAQIndex === index;
                return (
                  <div key={index} className={`pt-3.5 ${index === 0 ? 'pt-0' : ''}`}>
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between text-left text-xs font-black text-slate-750 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp size={14} className="text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown size={14} className="text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="mt-2 pl-0.5 text-xs text-slate-500 leading-relaxed font-semibold animate-in fade-in slide-in-from-top-1 duration-200 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick operations walkthrough card */}
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/15">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="text-indigo-500" size={14} /> Quick POS Terminal Guide
            </h4>
            <div className="space-y-2 text-xs text-slate-500 leading-relaxed font-medium">
              <p>
                <strong>1. Hold Carts:</strong> Open the Checkout panel, use the <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-700">Alt + N</code> or <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-700">F4</code> shortcut to hold multiple customer tickets.
              </p>
              <p>
                <strong>2. Search Shortcuts:</strong> Use <code className="bg-slate-100 border border-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-700">Ctrl + K</code> globally to trigger the search console dropdown and navigate pages.
              </p>
              <p>
                <strong>3. Printer Receipts:</strong> When invoice is saved, clicking the print receipt action prints clean invoice papers. Visual overlays are safely hidden.
              </p>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
