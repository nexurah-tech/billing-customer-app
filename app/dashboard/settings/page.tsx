'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Cpu, FileSpreadsheet, Percent, Bell, Info,
  Save, CheckCircle2, Loader2, Lock, CreditCard, Calendar, X, AlertTriangle
} from 'lucide-react';

interface ShopForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  gstin: string;
}

interface SystemConfig {
  invoicePrefix: string;
  invoiceAutoSequence: boolean;
  taxSystem: string;
  taxRate: number;
  whatsappEnabled: boolean;
}

export default function SettingsPage() {
  const [form, setForm] = useState<ShopForm>({
    name: '', email: '', phone: '', address: '', gstin: '',
  });
  const [config, setConfig] = useState<SystemConfig>({
    invoicePrefix: 'INV',
    invoiceAutoSequence: true,
    taxSystem: 'GST',
    taxRate: 18,
    whatsappEnabled: true,
  });
  const [initials, setInitials] = useState('ST');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Subscription states
  const [subData, setSubData] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    loadShop();
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/shop/subscription', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSubData(data.data);
      }
    } catch (err) {
      console.error('Error loading subscription details:', err);
    } finally {
      setSubLoading(false);
    }
  };

  const loadShop = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/shop', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const s = data.data.shop;
        setForm({
          name: s.name || '',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          gstin: s.gstin || '',
        });
        // Also update localStorage
        const existing = JSON.parse(localStorage.getItem('shop') || '{}');
        localStorage.setItem('shop', JSON.stringify({ ...existing, ...s }));
        computeInitials(s.name || '');
      } else {
        // Fallback to localStorage
        const shopData = localStorage.getItem('shop');
        if (shopData) {
          const parsed = JSON.parse(shopData);
          setForm({
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            address: parsed.address || '',
            gstin: parsed.gstin || '',
          });
          computeInitials(parsed.name || '');
        }
      }
    } catch {
      const shopData = localStorage.getItem('shop');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        setForm({
          name: parsed.name || '',
          email: parsed.email || '',
          phone: parsed.phone || '',
          address: parsed.address || '',
          gstin: parsed.gstin || '',
        });
        computeInitials(parsed.name || '');
      }
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const s = data.data.settings;
        setConfig({
          invoicePrefix: s.invoicePrefix || 'INV',
          invoiceAutoSequence: s.invoiceAutoSequence ?? true,
          taxSystem: s.taxSystem || 'GST',
          taxRate: s.taxRates?.standard ?? 18,
          whatsappEnabled: s.notificationPreferences?.whatsappNotifications ?? true,
        });
      }
    } catch {
      // keep defaults if settings cannot be loaded
    } finally {
      setLoading(false);
    }
  };

  const computeInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      setInitials((parts[0][0] + parts[1][0]).toUpperCase());
    } else {
      setInitials((name.substring(0, 2) || 'ST').toUpperCase());
    }
  };

  const handleChange = (field: keyof ShopForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError('');
    if (field === 'name') computeInitials(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Shop name is required'); return; }
    if (!form.phone.trim()) { setError('Contact phone is required'); return; }

    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/shop', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          gstin: form.gstin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Sync to localStorage so other parts of the app see it
        const existing = JSON.parse(localStorage.getItem('shop') || '{}');
        localStorage.setItem('shop', JSON.stringify({
          ...existing,
          name: form.name,
          phone: form.phone,
          address: form.address,
          gstin: form.gstin,
        }));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error || 'Failed to save changes');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500 font-medium py-16 text-xs uppercase tracking-widest animate-pulse">
          Retrieving settings dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="text-indigo-500 size-5.5" />
            POS Terminal Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Update store profile, contact details, and terminal configurations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* LEFT — Shop profile form */}
        <div className="md:col-span-7 space-y-6">
          <form onSubmit={handleSave}>
            <Card className="p-6 border-slate-200/80 shadow-xs space-y-6">
              {/* Visual store header */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200/40 rounded-2xl">
                <div className="size-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm border border-indigo-400/20 shadow-md select-none">
                  {initials}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {form.name || "Active Shop Terminal"}
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {form.email || "cashier@terminal.com"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Shop Name — editable */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Shop Name <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Your shop name"
                      className="border-slate-200 text-xs font-semibold h-10 rounded-xl focus-visible:border-indigo-500 bg-white text-slate-900"
                    />
                  </div>

                  {/* Email — locked */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      Terminal Email
                      <span className="inline-flex items-center gap-0.5 text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full font-bold border border-slate-200/60">
                        <Lock size={8} /> Locked
                      </span>
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      disabled
                      className="bg-slate-50 border-slate-200 text-xs font-semibold cursor-not-allowed h-10 rounded-xl text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone — editable */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Contact Phone <span className="text-red-400">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="border-slate-200 text-xs font-semibold h-10 rounded-xl focus-visible:border-indigo-500 bg-white text-slate-900"
                    />
                  </div>

                  {/* GSTIN — editable */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      GSTIN Registration
                    </label>
                    <Input
                      type="text"
                      value={form.gstin}
                      onChange={(e) =>
                        handleChange("gstin", e.target.value.toUpperCase())
                      }
                      placeholder="27AABCU9603R1Z0"
                      className="border-slate-200 text-xs font-mono h-10 rounded-xl focus-visible:border-indigo-500 bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* Address — editable, full width */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Shop Address
                  </label>
                  <Input
                    type="text"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="123 Main Street, City, State - 600001"
                    className="border-slate-200 text-xs font-semibold h-10 rounded-xl focus-visible:border-indigo-500 bg-white text-slate-900"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1.5 bg-red-50 border border-red-200/50 rounded-xl px-3 py-2">
                    <Info size={13} className="shrink-0" />
                    {error}
                  </p>
                )}

                {/* Email locked notice */}
                <div className="flex items-start gap-2.5 p-3.5 bg-indigo-50/40 border border-indigo-100/30 rounded-xl">
                  <Info size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-indigo-900 leading-relaxed font-semibold">
                    Terminal Email is locked to your registered account. To
                    change ownership or email, contact NexBill support.
                  </p>
                </div>

                {/* Save button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className={`w-full h-10 rounded-xl text-xs font-bold gap-2 transition-all cursor-pointer ${
                    saved
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}>
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Saving
                      Changes...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle2 size={15} /> Changes Saved!
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Save Shop Profile
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* RIGHT — System configs and subscription details */}
        <div className="md:col-span-5 space-y-6">
          {/* Card 1: System configs */}
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                System Configurations
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Configure active terminal algorithms
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/40 rounded-xl select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileSpreadsheet size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">
                      Invoice Numbers
                    </h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      Prefix: {config.invoicePrefix || "INV"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[9px] ${config.invoiceAutoSequence ? "bg-indigo-50 text-indigo-700 border border-indigo-100/40" : "bg-slate-100 text-slate-500 border border-slate-200/80"} px-2 py-0.5 rounded-full font-bold`}>
                  {config.invoiceAutoSequence
                    ? "Auto Sequence"
                    : "Manual Sequence"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/40 rounded-xl select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Percent size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">
                      Tax System
                    </h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {config.taxRate}% {config.taxSystem} (Default)
                    </p>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200/40 px-2 py-0.5 rounded-full font-bold">
                  Integrated
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/40 rounded-xl select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Bell size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">
                      Alert Messages
                    </h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {config.whatsappEnabled
                        ? "WhatsApp enabled"
                        : "WhatsApp disabled"}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[9px] ${config.whatsappEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200/40" : "bg-slate-100 text-slate-500 border border-slate-200/80"} px-2 py-0.5 rounded-full font-bold`}>
                  {config.whatsappEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Subscription & Billing */}
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard size={14} className="text-indigo-650" />
                Subscription & Billing
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Monitor subscription renewal and billing logs
              </p>
            </div>

            {subLoading ? (
              <div className="py-6 text-center text-xs text-slate-405 animate-pulse font-medium">
                Loading subscription status...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200/40 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Plan Status</span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black tracking-wider border ${
                      subData?.subscription?.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                        : subData?.subscription?.status === 'trialing'
                        ? 'bg-indigo-50 text-indigo-750 border-indigo-200/50'
                        : 'bg-amber-50 text-amber-750 border-amber-200/50'
                    }`}>
                      {subData?.subscription?.status || 'inactive'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Billing Cycle</span>
                    <span className="text-slate-800 uppercase text-[9.5px] font-black tracking-wider">
                      {subData?.subscription?.plan === 'free_trial' ? 'Free Trial' : 'Monthly Premium'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500">Expires On</span>
                    <span className="text-slate-750 font-mono text-[10.5px]">
                      {subData?.subscription?.expiresAt 
                        ? new Date(subData.subscription.expiresAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowQrModal(true)}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <CreditCard size={14} /> View QR & Instructions
                </Button>

                {/* Sub-section: Payment Log History */}
                <div className="pt-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 mb-2">
                    Payment Logs History
                  </h4>
                  {!subData?.payments || subData.payments.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic text-center py-4 font-bold border border-dashed border-slate-200 rounded-xl select-none">
                      No payment transactions logged.
                    </p>
                  ) : (
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden no-scrollbar bg-white shadow-2xs">
                      {subData.payments.map((payment: any, index: number) => (
                        <div key={index} className="p-3 text-[10.5px] leading-relaxed hover:bg-slate-50 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-slate-805">
                              ₹{payment.amount} Renewal
                            </p>
                            <p className="text-[9px] text-slate-450 font-semibold">
                              Method: {payment.paymentMethod?.toUpperCase()} {payment.referenceId ? `· Ref: ${payment.referenceId}` : ''}
                            </p>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded font-bold">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short'
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── QR Code Payment Instructions Modal ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 select-none">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col space-y-5 animate-in zoom-in-95 duration-200 relative select-text">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 select-none">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <CreditCard size={16} className="text-indigo-650" />
                Subscription Payment Instructions
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Instruction Body */}
            <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-650">
              <p>
                To renew your billing terminal, scan the UPI QR code below and transfer the fee. Once paid, please share a screenshot of the transaction details with the admin via WhatsApp.
              </p>

              {subData?.qrConfig?.paymentQrCodeUrl && (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center space-y-3 select-none">
                  <img
                    src={subData.qrConfig.paymentQrCodeUrl}
                    alt="UPI QR Code"
                    className="size-48 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-2xs"
                  />
                  <div className="text-center space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Contact Link</p>
                    <p className="text-xs font-mono font-black text-indigo-600">{subData.qrConfig.whatsappNumber}</p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200/40 rounded-xl p-3.5 flex items-start gap-2.5">
                <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-900 leading-normal">
                  Your billing terminal will be fully activated instantly after the admin verifies the screenshot.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 select-none">
              <a
                href={`https://wa.me/${(subData?.qrConfig?.whatsappNumber || '919600950190').replace(/[^0-9]/g, '')}?text=Hi%20Admin,%20I%20have%20sent%2520payment%2520for%2520my%2520billing%2520terminal%2520subscription.%20Here%20is%20the%20screenshot.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Send Screenshot via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
