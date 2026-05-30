'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Cpu, FileSpreadsheet, Percent, Bell, Info,
  Save, CheckCircle2, Loader2, Lock,
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

  useEffect(() => {
    loadShop();
  }, []);

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
                  <h3 className="text-sm font-extrabold text-slate-900">{form.name || 'Active Shop Terminal'}</h3>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{form.email || 'cashier@terminal.com'}</p>
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
                      onChange={(e) => handleChange('name', e.target.value)}
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
                      onChange={(e) => handleChange('phone', e.target.value)}
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
                      onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
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
                    onChange={(e) => handleChange('address', e.target.value)}
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
                    Terminal Email is locked to your registered account. To change ownership or email, contact Nexurah POS support.
                  </p>
                </div>

                {/* Save button */}
                <Button
                  type="submit"
                  disabled={saving}
                  className={`w-full h-10 rounded-xl text-xs font-bold gap-2 transition-all cursor-pointer ${
                    saved
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {saving ? (
                    <><Loader2 size={15} className="animate-spin" /> Saving Changes...</>
                  ) : saved ? (
                    <><CheckCircle2 size={15} /> Changes Saved!</>
                  ) : (
                    <><Save size={15} /> Save Shop Profile</>
                  )}
                </Button>
              </div>
            </Card>
          </form>
        </div>

        {/* RIGHT — System configs (read-only) */}
        <div className="md:col-span-5 space-y-6">
          <Card className="p-6 border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Configurations</h3>
              <p className="text-[10px] text-slate-400 mt-1">Configure active terminal algorithms</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/40 rounded-xl select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <FileSpreadsheet size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Invoice Numbers</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Prefix: {config.invoicePrefix || 'INV'}</p>
                  </div>
                </div>
                <span className={`text-[9px] ${config.invoiceAutoSequence ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/40' : 'bg-slate-100 text-slate-500 border border-slate-200/80'} px-2 py-0.5 rounded-full font-bold`}>
                  {config.invoiceAutoSequence ? 'Auto Sequence' : 'Manual Sequence'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/40 rounded-xl select-none">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Percent size={15} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">Tax System</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">{config.taxRate}% {config.taxSystem} (Default)</p>
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
                    <h5 className="text-xs font-bold text-slate-800">Alert Messages</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">
                      {config.whatsappEnabled ? 'WhatsApp enabled' : 'WhatsApp disabled'}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] ${config.whatsappEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/40' : 'bg-slate-100 text-slate-500 border border-slate-200/80'} px-2 py-0.5 rounded-full font-bold`}>
                  {config.whatsappEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
