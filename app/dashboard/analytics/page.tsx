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
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  Award,
  Calendar,
  Zap,
  Crown,
  Trophy,
  Medal,
  Search,
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

export default function DetailedAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Default to last 7 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics?startDate=${startDate}&endDate=${endDate}`, {
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

  useEffect(() => {
    fetchAnalytics();
  }, [router]); // We don't put startDate/endDate here so it only fetches on click

  const handleApplyFilter = () => {
    fetchAnalytics();
  };

  // Format trend data dynamically
  const trendData = analytics?.revenueTrend.map((item) => {
    const isHourly = item._id.length > 10;
    let label = item._id;
    if (isHourly) {
      const d = new Date(item._id + ':00:00'); 
      label = d.toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true });
    } else {
      const d = new Date(item._id);
      label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
    return { ...item, label };
  }) || [];

  const topProductsList = analytics?.topProducts || [];
  const maxRevenue = Math.max(...topProductsList.map((p) => p.totalRevenue), 1);

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
      {/* Header & Date Range Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200/50">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl shadow-md text-white shadow-indigo-500/15">
            <Calendar size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              Detailed <span className="text-indigo-600 font-black">Analytics</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-2 font-semibold tracking-wide">
              Analyze specific days, weeks, or custom date ranges
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button
            onClick={handleApplyFilter}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Search size={14} strokeWidth={3} />
            Apply
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          {/* KPI Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5 flex flex-col gap-3 min-h-[120px] rounded-2xl bg-white border-slate-200">
                <div className="flex justify-between items-center">
                  <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="size-8 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse mt-1" />
                <div className="h-4 w-28 bg-slate-100 rounded-lg animate-pulse mt-auto" />
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="p-5 lg:col-span-8 rounded-2xl bg-white border-slate-200 h-[380px] flex flex-col">
               <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-6" />
               <div className="flex-1 bg-slate-100/50 rounded-xl animate-pulse w-full" />
            </Card>
            <Card className="p-5 lg:col-span-4 rounded-2xl bg-white border-slate-200 h-[380px] flex flex-col">
               <div className="h-4 w-40 bg-slate-200 rounded animate-pulse mb-6" />
               <div className="space-y-4 flex-1">
                 {[1, 2, 3, 4, 5].map(i => (
                   <div key={i} className="flex gap-3 items-center">
                     <div className="size-8 bg-slate-200 rounded-full animate-pulse shrink-0" />
                     <div className="flex-1 space-y-2">
                       <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
                       <div className="h-2 w-1/2 bg-slate-100 rounded animate-pulse" />
                     </div>
                   </div>
                 ))}
               </div>
            </Card>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-indigo-600 border-y border-r border-slate-200 shadow-2xs hover:shadow-md transition-all bg-white rounded-2xl min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <IndianRupee size={13} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-900 mt-1">
                ₹{(analytics?.summary?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-sky-500 border-y border-r border-slate-200 shadow-2xs hover:shadow-md transition-all bg-white rounded-2xl min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <ShoppingBag size={13} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-900 mt-1">
                {(analytics?.summary?.totalOrders || 0).toLocaleString('en-IN')}
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-violet-500 border-y border-r border-slate-200 shadow-2xs hover:shadow-md transition-all bg-white rounded-2xl min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Bill Value</span>
                <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
                  <TrendingUp size={13} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-900 mt-1">
                ₹{(analytics?.summary?.averageOrderValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </Card>

            <Card className="p-5 flex flex-col gap-2.5 border-l-4 border-l-amber-500 border-y border-r border-slate-200 shadow-2xs hover:shadow-md transition-all bg-white rounded-2xl min-h-[120px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Buyers</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <Users size={13} strokeWidth={2.5} />
                </div>
              </div>
              <div className="text-3xl font-black tracking-tight text-slate-900 mt-1">
                {(analytics?.summary?.activeCustomers || 0).toLocaleString('en-IN')}
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="p-5 border-slate-200 shadow-xs lg:col-span-8 flex flex-col justify-between rounded-2xl bg-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-indigo-500" />
                    Revenue Trend
                  </h3>
                </div>
              </div>
              
              {trendData.length === 0 ? (
                <div className="h-[290px] flex items-center justify-center border border-dashed rounded-xl border-slate-200">
                  <p className="text-xs font-bold text-slate-400">No data for selected range</p>
                </div>
              ) : (
                <div className="h-[290px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#64748b" fontSize={10} dy={8} tick={{ fill: '#334155', fontWeight: 600 }} />
                      <YAxis tickLine={false} axisLine={false} stroke="#64748b" fontSize={10} width={55} tickFormatter={(v) => `₹${v}`} tick={{ fill: '#334155', fontWeight: 600 }} />
                      <RechartsTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-slate-900 border border-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl text-[11px]">
                                <p className="font-extrabold text-slate-400 mb-2 uppercase tracking-widest text-[9px]">{label}</p>
                                <p className="font-semibold text-slate-300">
                                  Revenue: <span className="font-black text-indigo-400 text-[12px]">₹{payload[0].value?.toLocaleString('en-IN')}</span>
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card className="p-5 border-slate-200 shadow-xs lg:col-span-4 flex flex-col gap-4 rounded-2xl bg-white">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="text-indigo-500 size-4" />
                  Top Products
                </h3>
              </div>

              {topProductsList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed rounded-2xl border-slate-200">
                  <ShoppingBag size={24} className="text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-bold">No products sold</p>
                </div>
              ) : (
                <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
                  {topProductsList.map((product, index) => (
                    <div key={product.productName} className="flex items-center gap-3.5 py-2">
                      <div className="shrink-0">{getRankBadge(index)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs">
                          <p className="font-extrabold text-slate-800 truncate">{product.productName}</p>
                          <span className="font-black text-slate-900">
                            ₹{product.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">{product.totalQuantity} items</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
