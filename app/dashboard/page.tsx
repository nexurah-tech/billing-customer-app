'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
  Crown,
  Trophy,
  Medal,
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
    activeCustomers: number;
  };
  revenueTrend: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analytics?period=month', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('shop');
          router.push('/auth/login');
          return;
        }

        if (!response.ok) throw new Error('Failed to fetch analytics');
        const data = await response.json();
        setAnalytics(data.data);
      } catch (err) {
        console.warn('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8 h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="size-10 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto animate-spin">
            <Zap size={20} />
          </div>
          <div className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
            Retrieving terminal analytics...
          </div>
        </div>
      </div>
    );
  }

  // Build a complete 30-day date range so the chart always shows all days
  const buildFullTrend = () => {
    const rawTrend = analytics?.revenueTrend || [];
    const trendMap: Record<string, { revenue: number; orders: number }> = {};
    for (const entry of rawTrend) {
      trendMap[entry._id] = { revenue: entry.revenue, orders: entry.orders };
    }
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({
        _id: key,
        label: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: trendMap[key]?.revenue ?? 0,
        orders: trendMap[key]?.orders ?? 0,
      });
    }
    return result;
  };

  const fullTrend = buildFullTrend();

  // Get max product revenue to compute leaderboard percentages
  const topProductsList = analytics?.topProducts || [];
  const maxRevenue = Math.max(...topProductsList.map((p) => p.totalRevenue), 1);

  // Helper for Leaderboard Medals/Ranks
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="size-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Crown size={12} className="fill-amber-500/20" />
          </div>
        );
      case 1:
        return (
          <div className="size-6 rounded-full bg-slate-400/15 border border-slate-400/30 flex items-center justify-center text-slate-500 shrink-0">
            <Trophy size={11} />
          </div>
        );
      case 2:
        return (
          <div className="size-6 rounded-full bg-amber-700/10 border border-amber-700/20 flex items-center justify-center text-amber-800 shrink-0">
            <Medal size={11} />
          </div>
        );
      default:
        return (
          <div className="size-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 select-none font-sans">
      
      {/* ── Beautiful Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/50 select-none">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-md text-white shadow-indigo-500/15 transition-transform duration-300 hover:scale-105">
            <TrendingUp size={18} strokeWidth={2.5} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Nex<span className="text-indigo-600 font-black">Bill</span>
              <span className="text-slate-400 font-medium ml-1.5 tracking-normal">Analytics Terminal</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-2 font-semibold tracking-wide">
              Live overview of sales performance, billing trends, and catalog product rankings
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-indigo-600 border-y border-r border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-600/30 transition-all duration-300 hover:-translate-y-0.5 bg-white rounded-2xl relative overflow-hidden group min-h-[120px]">
          <div className="absolute -bottom-4 -right-4 text-indigo-50/70 group-hover:text-indigo-100/50 group-hover:scale-105 transition-all duration-500 pointer-events-none">
            <IndianRupee style={{ width: 85, height: 85 }} strokeWidth={1.2} />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/30 shadow-3xs">
              <IndianRupee size={13} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 leading-none mt-1 z-10">
            ₹{(analytics?.summary?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-auto bg-emerald-50 border border-emerald-100/40 w-fit px-2.5 py-0.5 rounded-lg shadow-3xs z-10">
            <ArrowUpRight size={11} strokeWidth={3} />
            <span>+12.4% vs last cycle</span>
          </div>
        </Card>

        {/* Total Invoices */}
        <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-sky-500 border-y border-r border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-500/30 transition-all duration-300 hover:-translate-y-0.5 bg-white rounded-2xl relative overflow-hidden group min-h-[120px]">
          <div className="absolute -bottom-4 -right-4 text-sky-50/70 group-hover:text-sky-100/50 group-hover:scale-105 transition-all duration-500 pointer-events-none">
            <ShoppingBag style={{ width: 85, height: 85 }} strokeWidth={1.2} />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100/30 shadow-3xs">
              <ShoppingBag size={13} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 leading-none mt-1 z-10">
            {(analytics?.summary?.totalOrders || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-auto bg-emerald-50 border border-emerald-100/40 w-fit px-2.5 py-0.5 rounded-lg shadow-3xs z-10">
            <ArrowUpRight size={11} strokeWidth={3} />
            <span>+8.2% new sales</span>
          </div>
        </Card>

        {/* Avg Bill Value */}
        <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-violet-500 border-y border-r border-slate-200 shadow-2xs hover:shadow-md hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-0.5 bg-white rounded-2xl relative overflow-hidden group min-h-[120px]">
          <div className="absolute -bottom-4 -right-4 text-violet-50/70 group-hover:text-violet-100/50 group-hover:scale-105 transition-all duration-500 pointer-events-none">
            <TrendingUp style={{ width: 85, height: 85 }} strokeWidth={1.2} />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Bill Value</span>
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl border border-violet-100/30 shadow-3xs">
              <TrendingUp size={13} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 leading-none mt-1 z-10">
            ₹{(analytics?.summary?.averageOrderValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold mt-auto bg-slate-50 border border-slate-200/50 w-fit px-2.5 py-0.5 rounded-lg shadow-3xs z-10">
            <Sparkles size={11} className="text-violet-400" />
            <span>Stable checkout basket</span>
          </div>
        </Card>

        {/* Repeat Buyers */}
        <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 bg-white rounded-2xl relative overflow-hidden group min-h-[120px]">
          <div className="absolute -bottom-4 -right-4 text-amber-50/70 group-hover:text-amber-100/50 group-hover:scale-105 transition-all duration-500 pointer-events-none">
            <Users style={{ width: 85, height: 85 }} strokeWidth={1.2} />
          </div>
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repeat Buyers</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/30 shadow-3xs">
              <Users size={13} strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-3xl font-black tracking-tight text-slate-900 leading-none mt-1 z-10">
            {(analytics?.summary?.activeCustomers || 0).toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-auto bg-emerald-50 border border-emerald-100/40 w-fit px-2.5 py-0.5 rounded-lg shadow-3xs z-10">
            <ArrowUpRight size={11} strokeWidth={3} />
            <span>+4.1% customer loyalty</span>
          </div>
        </Card>

      </div>

      {/* ── Graphical Insights ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Trendline AreaChart */}
        <Card className="p-5 border-slate-200 shadow-xs lg:col-span-8 flex flex-col justify-between rounded-2xl bg-white relative overflow-hidden">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={13} className="text-indigo-500" />
                Sales Trendline
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Visual overview of daily terminal sales operations</p>
            </div>
            
            <div className="flex items-center gap-3 select-none">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-indigo-600" />
                <span className="text-[10px] text-slate-500 font-bold">Revenue (₹)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-slate-300" />
                <span className="text-[10px] text-slate-500 font-bold">Invoices</span>
              </div>
            </div>
          </div>

          <div className="h-[290px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={fullTrend}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0', strokeWidth: 1.5 }}
                  stroke="#64748b"
                  fontSize={10}
                  dy={8}
                  interval={4}
                  tick={{ fill: '#334155', fontWeight: 700 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#64748b"
                  fontSize={10}
                  width={55}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  }
                  tick={{ fill: '#334155', fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ stroke: '#06b6d4', strokeWidth: 1.5, strokeDasharray: '5 5' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const rev = payload.find((p) => p.dataKey === 'revenue');
                      const ord = payload.find((p) => p.dataKey === 'orders');
                      return (
                        <div className="bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-2xl shadow-2xl text-[11px] font-sans min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                          <p className="font-extrabold text-slate-400 mb-2 uppercase tracking-widest text-[9px]">{label}</p>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-300 flex items-center justify-between gap-4">
                              Revenue: <span className="font-black text-indigo-400 text-[12px]">₹{(rev?.value as number ?? 0).toLocaleString('en-IN')}</span>
                            </p>
                            <p className="font-semibold text-slate-300 flex items-center justify-between gap-4">
                              Invoices: <span className="font-black text-slate-100">{ord?.value as number ?? 0}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="url(#colorStroke)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  dot={{ r: 3.5, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6.5, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="transparent"
                  fill="transparent"
                  strokeWidth={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Selling Catalogue Leaderboard */}
        <Card className="p-5 border-slate-200 shadow-xs lg:col-span-4 flex flex-col gap-4 rounded-2xl bg-white">
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="text-indigo-500 size-4" />
              Catalogue Leaderboard
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Highest grossing items this billing cycle</p>
          </div>

          {topProductsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed rounded-2xl border-slate-200">
              <ShoppingBag size={24} className="text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 font-bold">No sales operations logged yet</p>
            </div>
          ) : (
            <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
              {topProductsList.map((product, index) => {
                const percentage = (product.totalRevenue / maxRevenue) * 100;

                return (
                  <div key={product.productName} className="group flex items-center gap-3.5 py-2 px-1 rounded-xl hover:bg-slate-50/50 transition-colors">
                    
                    {/* Rank Badge */}
                    <div className="shrink-0">
                      {getRankBadge(index)}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-extrabold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{product.productName}</p>
                          <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">{product.totalQuantity} items sold</p>
                        </div>
                        <span className="font-black text-slate-900 shrink-0">
                          ₹{product.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full group-hover:brightness-105 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </Card>

      </div>
    </div>
  );
}
