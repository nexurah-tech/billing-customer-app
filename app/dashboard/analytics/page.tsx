'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  Award,
  BarChart2,
  SlidersHorizontal,
  ChevronRight,
  Package,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
    activeCustomers: number;
  };
  revenueTrend: Array<{ _id: string; revenue: number; orders: number }>;
  topProducts: Array<{ productName: string; totalQuantity: number; totalRevenue: number }>;
  paymentStatusBreakdown: Array<{ _id: string; count: number; total: number }>;
  paymentMethodBreakdown: Array<{ _id: string; count: number; total: number }>;
  dayOfWeekDistribution: Array<{ label: string; orders: number; revenue: number }>;
}

const PRESET_RANGES = [
  { label: 'Today', days: 0 },
  { label: '7 Days', days: 6 },
  { label: '30 Days', days: 29 },
  { label: '90 Days', days: 89 },
];

const METHOD_ICONS: Record<string, any> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
  cheque: Wallet,
};
const METHOD_COLORS: Record<string, string> = {
  cash: '#10b981',
  upi: '#6366f1',
  card: '#f59e0b',
  cheque: '#8b5cf6',
};
const STATUS_COLORS: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  paid:    { color: '#10b981', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Paid' },
  unpaid:  { color: '#f59e0b', bg: 'bg-amber-500/10',   icon: Clock,        label: 'Unpaid' },
  overdue: { color: '#ef4444', bg: 'bg-red-500/10',     icon: XCircle,      label: 'Overdue' },
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={800}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DetailedAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePreset, setActivePreset] = useState(1);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchAnalytics = async (sd = startDate, ed = endDate) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/analytics?startDate=${sd}&endDate=${ed}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token'); localStorage.removeItem('shop');
        router.push('/auth/login'); return;
      }
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setAnalytics(data.data);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  };

  const applyPreset = (idx: number) => {
    const preset = PRESET_RANGES[idx];
    const end = new Date(), start = new Date();
    start.setDate(start.getDate() - preset.days);
    const sd = start.toISOString().slice(0, 10);
    const ed = end.toISOString().slice(0, 10);
    setActivePreset(idx); setStartDate(sd); setEndDate(ed);
    fetchAnalytics(sd, ed);
  };

  useEffect(() => { fetchAnalytics(); }, [router]); // eslint-disable-line

  /**
   * Build a COMPLETE date/hour sequence for the selected range so the chart
   * always shows every slot — missing days/hours default to { revenue:0, orders:0 }.
   * This prevents the "single floating dot" problem when data is sparse.
   */
  const buildFullRange = () => {
    const raw = analytics?.revenueTrend || [];
    const rawMap: Record<string, { revenue: number; orders: number }> = {};
    for (const item of raw) rawMap[item._id] = { revenue: item.revenue, orders: item.orders };

    const startMs = new Date(startDate + 'T00:00:00Z').getTime();
    const endMs   = new Date(endDate   + 'T23:59:59Z').getTime();
    const diffDays = (endMs - startMs) / (1000 * 60 * 60 * 24);

    // Use hourly slots when range ≤ 2 days (matches the analytics API logic)
    const useHourly = diffDays <= 2;
    const result: Array<{ _id: string; label: string; revenue: number; orders: number }> = [];

    if (useHourly) {
      const totalHours = Math.ceil((endMs - startMs) / (1000 * 60 * 60));
      for (let i = 0; i <= totalHours && i < 48; i++) {
        const d   = new Date(startMs + i * 3600_000);
        const key = d.toISOString().slice(0, 13);
        const label = d.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true, timeZone: 'UTC' });
        result.push({ _id: key, label, ...(rawMap[key] ?? { revenue: 0, orders: 0 }) });
      }
    } else {
      const totalDays = Math.ceil(diffDays) + 1;
      for (let i = 0; i < totalDays; i++) {
        const d   = new Date(startMs + i * 86_400_000);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        result.push({ _id: key, label, ...(rawMap[key] ?? { revenue: 0, orders: 0 }) });
      }
    }
    return result;
  };

  const fullTrend = buildFullRange();
  const maxOrders = Math.max(...fullTrend.map(t => t.orders), 1);
  // Only show the Orders series when there is at least one non-zero order
  const hasOrders = fullTrend.some(t => t.orders > 0);

  // Human-readable range label for the chart header
  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00Z');
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  };
  const rangeLabel = startDate === endDate
    ? fmtDate(startDate)
    : `${fmtDate(startDate)} → ${fmtDate(endDate)}`;

  const topProducts = analytics?.topProducts || [];
  const maxQty = Math.max(...topProducts.map(p => p.totalQuantity), 1);

  // Payment method pie data
  const methodData = (analytics?.paymentMethodBreakdown || []).map(m => ({
    name: (m._id || 'other').charAt(0).toUpperCase() + (m._id || 'other').slice(1),
    key: (m._id || 'other').toLowerCase(),
    value: m.count,
    revenue: m.total,
    fill: METHOD_COLORS[(m._id || 'other').toLowerCase()] || '#94a3b8',
  }));

  // Payment status summary
  const statusData = (analytics?.paymentStatusBreakdown || []);
  const totalInvoices = statusData.reduce((s, x) => s + x.count, 0);

  // Day-of-week bars
  const dowData = analytics?.dayOfWeekDistribution || [];
  const maxDowOrders = Math.max(...dowData.map(d => d.orders), 1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans relative">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed top-0 left-64 w-[500px] h-[300px] bg-indigo-500/[0.04] rounded-full blur-[100px]" />
      <div className="pointer-events-none fixed bottom-20 right-10 w-[400px] h-[250px] bg-violet-500/[0.04] rounded-full blur-[100px]" />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-5 border-b border-slate-200/60">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-sky-500 via-indigo-500 to-violet-600 rounded-2xl shadow-lg text-white shadow-indigo-500/25">
            <BarChart2 size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Detailed <span className="text-indigo-600">Analytics</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1.5 font-semibold tracking-wide">
              Payment breakdown · Order patterns · Product performance
            </p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-2.5 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm min-w-[340px]">
          <div className="flex gap-1.5">
            {PRESET_RANGES.map((p, i) => (
              <button key={p.label} id={`preset-btn-${i}`} onClick={() => applyPreset(i)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  activePreset === i ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <SlidersHorizontal size={11} className="text-slate-400 shrink-0" />
            <input type="date" value={startDate}
              onChange={e => { setStartDate(e.target.value); setActivePreset(-1); }}
              className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/40" />
            <ChevronRight size={11} className="text-slate-400 shrink-0" />
            <input type="date" value={endDate}
              onChange={e => { setEndDate(e.target.value); setActivePreset(-1); }}
              className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/40" />
            <button id="custom-apply-btn" onClick={() => { setActivePreset(-1); fetchAnalytics(startDate, endDate); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 shadow-sm">
              Apply
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-[100px] bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-[280px] bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1,2].map(i => <div key={i} className="h-[320px] bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        </div>
      ) : (
        <>
          {/* ── Row 1: KPI Summary Strip ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${(analytics?.summary?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-l-indigo-500' },
              { label: 'Invoices Issued', value: (analytics?.summary?.totalOrders || 0).toString(), icon: ShoppingBag, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-l-sky-500' },
              { label: 'Avg Bill Value', value: `₹${(analytics?.summary?.averageOrderValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-l-violet-500' },
              { label: 'Unique Buyers', value: (analytics?.summary?.activeCustomers || 0).toString(), icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-500' },
            ].map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`group bg-white rounded-2xl border border-slate-200 border-l-4 ${card.border} p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{card.label}</span>
                    <div className={`p-1.5 ${card.bg} ${card.color} rounded-lg`}><Icon size={12} strokeWidth={2.5} /></div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">{card.value}</div>
                </div>
              );
            })}
          </div>

          {/* ── Row 2: Payment Method Donut + Payment Status + Day of Week ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Payment Method Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                  <Wallet size={14} className="text-emerald-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-none">Payment Methods</h3>
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">How customers pay</p>
                </div>
              </div>

              {methodData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-300">No payment data</p>
                </div>
              ) : (
                <>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                          innerRadius={45} outerRadius={75} paddingAngle={3}
                          labelLine={false} label={renderCustomLabel}>
                          {methodData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} stroke="white" strokeWidth={2} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl shadow-xl text-[10px]">
                                  <p className="font-black text-white capitalize">{d.name}</p>
                                  <p className="text-slate-300 font-bold">{d.value} invoices</p>
                                  <p className="font-bold" style={{ color: d.fill }}>₹{d.revenue.toLocaleString('en-IN')}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-2">
                    {methodData.map(m => {
                      const Icon = METHOD_ICONS[m.key] || Wallet;
                      const pct = Math.round((m.value / (analytics?.summary?.totalOrders || 1)) * 100);
                      return (
                        <div key={m.key} className="flex items-center gap-2.5">
                          <div className="size-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.fill + '20' }}>
                            <Icon size={11} style={{ color: m.fill }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-[10px] mb-0.5">
                              <span className="font-bold text-slate-700 capitalize">{m.name}</span>
                              <span className="font-black text-slate-900">{pct}%</span>
                            </div>
                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.fill }} />
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 shrink-0">{m.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Invoice Status Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-sky-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-none">Invoice Status</h3>
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Paid vs pending breakdown</p>
                </div>
              </div>

              {statusData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-300">No data</p>
                </div>
              ) : (
                <div className="flex-1 space-y-3">
                  {/* Grand total */}
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-3xl font-black text-slate-900">{totalInvoices}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Total Invoices</p>
                  </div>
                  {statusData.map(s => {
                    const cfg = STATUS_COLORS[s._id?.toLowerCase()] || { color: '#94a3b8', bg: 'bg-slate-100', icon: Package, label: s._id };
                    const Icon = cfg.icon;
                    const pct = totalInvoices > 0 ? Math.round((s.count / totalInvoices) * 100) : 0;
                    return (
                      <div key={s._id} className={`flex items-center gap-3 p-3 ${cfg.bg} rounded-xl border border-current/5`}>
                        <div className="size-8 rounded-xl bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
                          <Icon size={14} style={{ color: cfg.color }} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="font-extrabold text-slate-800">{cfg.label}</span>
                            <span className="font-black" style={{ color: cfg.color }}>{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
                          </div>
                          <div className="flex justify-between mt-1 text-[9px] font-bold text-slate-500">
                            <span>{s.count} invoice{s.count !== 1 ? 's' : ''}</span>
                            <span>₹{s.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Day-of-Week Pattern */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="size-8 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
                  <Calendar size={14} className="text-violet-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 leading-none">Busiest Days</h3>
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Orders by day of week</p>
                </div>
              </div>

              {dowData.every(d => d.orders === 0) ? (
                <div className="flex-1 flex items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-xs font-bold text-slate-300">No data</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-2">
                    {dowData.map((d, i) => {
                      const pct = Math.round((d.orders / maxDowOrders) * 100);
                      const isMax = d.orders === maxDowOrders && d.orders > 0;
                      return (
                        <div key={d.label} className="flex items-center gap-2.5">
                          <span className={`text-[10px] font-black w-6 shrink-0 text-right ${isMax ? 'text-violet-600' : 'text-slate-400'}`}>{d.label}</span>
                          <div className="flex-1 h-5 bg-slate-100 rounded-md overflow-hidden relative">
                            <div
                              className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-1.5"
                              style={{ width: `${Math.max(pct, 4)}%`, background: isMax ? '#8b5cf6' : '#c4b5fd' }}
                            >
                              {d.orders > 0 && (
                                <span className="text-[8px] font-black text-white">{d.orders}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 w-12 text-right shrink-0">
                            {d.revenue > 0 ? `₹${d.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[9.5px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Sparkles size={9} className="text-violet-500" /> Busiest: {dowData.find(d => d.orders === maxDowOrders)?.label || '—'}</span>
                    <span>{dowData.reduce((s, d) => s + d.orders, 0)} total orders</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Row 3: Revenue Trend (dark panel) + Top Products ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Revenue Trend – Dark Panel */}
            <div className="lg:col-span-8 rounded-2xl overflow-hidden shadow-lg border border-slate-800/60"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
              <div className="px-6 pt-5 pb-4 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <TrendingUp size={14} className="text-indigo-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white tracking-tight">Revenue Trend</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{rangeLabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold">
                    <span className="flex items-center gap-1.5 text-indigo-400"><span className="inline-block w-5 h-0.5 rounded-full bg-indigo-500" />Revenue</span>
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="inline-block w-5 h-0.5 rounded-full bg-emerald-500 border-dashed" />Orders</span>
                  </div>
                </div>
              </div>
              <div className="px-4 pt-4 pb-5">
                {fullTrend.every(t => t.revenue === 0 && t.orders === 0) ? (
                  <div className="h-[240px] flex flex-col items-center justify-center gap-3">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <BarChart2 size={24} className="text-slate-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-600">No sales recorded for this period</p>
                    <p className="text-[10px] text-slate-700 font-semibold">{rangeLabel}</p>
                  </div>
                ) : (
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={fullTrend} margin={{ top: 10, right: hasOrders ? 36 : 8, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="aRevGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.03} />
                          </linearGradient>
                          <linearGradient id="aOrdGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="label"
                          tickLine={false}
                          axisLine={false}
                          fontSize={9}
                          dy={8}
                          tick={{ fill: '#64748b', fontWeight: 700 }}
                          interval={Math.ceil(fullTrend.length / 8)}
                        />
                        <YAxis
                          yAxisId="rev"
                          tickLine={false}
                          axisLine={false}
                          fontSize={9}
                          width={52}
                          tickFormatter={v => v === 0 ? '₹0' : `₹${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                          tick={{ fill: '#818cf8', fontWeight: 700 }}
                        />
                        {hasOrders && (
                          <YAxis
                            yAxisId="ord"
                            orientation="right"
                            tickLine={false}
                            axisLine={false}
                            fontSize={9}
                            width={32}
                            allowDecimals={false}
                            tickCount={Math.min(maxOrders + 1, 6)}
                            tick={{ fill: '#34d399', fontWeight: 700 }}
                          />
                        )}
                        <RechartsTooltip
                          cursor={{ stroke: 'rgba(99,102,241,0.25)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const rev = payload.find((p: any) => p.dataKey === 'revenue');
                              const ord = payload.find((p: any) => p.dataKey === 'orders');
                              return (
                                <div className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/20 px-4 py-3 rounded-2xl shadow-2xl text-[11px] min-w-[150px]">
                                  <p className="font-extrabold text-slate-400 mb-2.5 uppercase tracking-widest text-[9px]">{label}</p>
                                  <div className="space-y-1.5">
                                    {rev && (
                                      <div className="flex justify-between gap-6">
                                        <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                                          <span className="size-2 rounded-full bg-indigo-500" />
                                          Revenue
                                        </span>
                                        <span className="font-black text-indigo-400">₹{(rev.value || 0).toLocaleString('en-IN')}</span>
                                      </div>
                                    )}
                                    {ord && (
                                      <div className="flex justify-between gap-6">
                                        <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                                          <span className="size-2 rounded-full bg-emerald-500" />
                                          Orders
                                        </span>
                                        <span className="font-black text-emerald-400">{ord.value}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          yAxisId="rev"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fill="url(#aRevGrad)"
                          dot={false}
                          activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                        />
                        {hasOrders && (
                          <Area
                            yAxisId="ord"
                            type="monotone"
                            dataKey="orders"
                            stroke="#10b981"
                            strokeWidth={1.5}
                            strokeDasharray="5 3"
                            fill="url(#aOrdGrad)"
                            dot={false}
                            activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products – Ranked List */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
                    <Award size={14} className="text-amber-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 leading-none">Top Products</h3>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">By units sold · this range</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{topProducts.length} items</span>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {topProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                    <Package size={28} className="text-slate-200" />
                    <p className="text-xs font-bold text-slate-400">No products sold</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topProducts.map((p, i) => {
                      const COLORS = ['#6366f1','#0ea5e9','#8b5cf6','#f59e0b','#10b981'];
                      const col = COLORS[i % COLORS.length];
                      const pct = Math.round((p.totalQuantity / maxQty) * 100);
                      return (
                        <div key={p.productName} className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="size-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: col + '18', color: col }}>{i + 1}</div>
                            <div className="flex-1 min-w-0 flex justify-between items-center gap-1">
                              <p className="text-[11px] font-extrabold text-slate-800 truncate">{p.productName}</p>
                              <span className="text-[11px] font-black shrink-0" style={{ color: col }}>₹{p.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: col }} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 shrink-0">{p.totalQuantity} units</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 4: Footer summary row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Customers', value: analytics?.summary?.totalCustomers || 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Active This Period', value: analytics?.summary?.activeCustomers || 0, icon: Sparkles, color: 'text-violet-600', bg: 'bg-violet-50' },
              { label: 'Products Tracked', value: topProducts.length, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Payment Methods', value: methodData.length, icon: ArrowUpRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-sm transition-all">
                  <div className={`size-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}><Icon size={15} strokeWidth={2.5} /></div>
                  <div>
                    <p className="text-lg font-black text-slate-900 leading-none">{s.value.toLocaleString('en-IN')}</p>
                    <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
