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
  BarChart,
  Bar,
} from 'recharts';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
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
      <div className="p-8">
        <div className="text-center text-slate-500 font-medium py-20 text-xs uppercase tracking-widest animate-pulse">
          Retrieving terminal analytics...
        </div>
      </div>
    );
  }

  // Get max product revenue to compute leaderboard percentages
  const topProductsList = analytics?.topProducts || [];
  const maxRevenue = Math.max(...topProductsList.map((p) => p.totalRevenue), 1);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Title section */}
      

      {/* KPI Cards Redone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="p-4 border-slate-200/80 hover:border-indigo-500/30 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-indigo-600 transition-transform duration-300 group-hover:scale-105">
            <IndianRupee size={60} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/40">
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            ₹
            {(analytics?.summary?.totalRevenue || 0).toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold mt-1.5 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <ArrowUpRight size={11} />
            <span>+12.4% vs last cycle</span>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-4 border-slate-200/80 hover:border-teal-500/30 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-teal-600 transition-transform duration-300 group-hover:scale-105">
            <ShoppingBag size={60} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
            <div className="p-1.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100/40">
              <ShoppingBag size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            {analytics?.summary?.totalOrders || 0}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold mt-1.5 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <ArrowUpRight size={11} />
            <span>+8.2% invoices</span>
          </div>
        </Card>

        {/* Avg Order Value */}
        <Card className="p-4 border-slate-200/80 hover:border-violet-500/30 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-violet-600 transition-transform duration-300 group-hover:scale-105">
            <TrendingUp size={60} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg Bill Value</span>
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-100/40">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            ₹
            {(analytics?.summary?.averageOrderValue || 0).toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold mt-1.5 bg-slate-100 w-fit px-2 py-0.5 rounded-full">
            <span>Stable basket size</span>
          </div>
        </Card>

        {/* Active Customers */}
        <Card className="p-4 border-slate-200/80 hover:border-amber-500/30 shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-5 text-amber-600 transition-transform duration-300 group-hover:scale-105">
            <Users size={60} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loyal Customers</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100/40">
              <Users size={14} />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            {analytics?.summary?.activeCustomers || 0}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold mt-1.5 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <ArrowUpRight size={11} />
            <span>+4.1% repeat buyers</span>
          </div>
        </Card>
      </div>

      {/* Graphical Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Trend - Premium AreaChart with defs gradient */}
        <Card className="p-6 border-slate-200/80 shadow-xs lg:col-span-8 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Sales Trendline
            </h3>
            <p className="text-[11px] text-slate-500 mb-6">Visual overview of daily terminal sales operations</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analytics?.revenueTrend || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="_id"
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  dy={10}
                />
                <YAxis
                  tickLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  dx={-10}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs font-sans">
                          <p className="font-semibold text-slate-400 mb-1">Date: {label}</p>
                          <p className="font-bold text-indigo-400">
                            Revenue: ₹
                            {payload[0].value?.toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Selling Products - Leaderboard */}
        <Card className="p-6 border-slate-200/80 shadow-xs lg:col-span-4 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="text-indigo-500 size-4.5" />
              Catalogue Leaderboard
            </h3>
            <p className="text-[11px] text-slate-500">Highest grossing items this billing cycle</p>
          </div>

          {topProductsList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 border border-dashed rounded-2xl border-slate-200">
              <ShoppingBag size={24} className="text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 font-bold">No sales operations logged yet</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-1">
              {topProductsList.map((product) => {
                const percentage = (product.totalRevenue / maxRevenue) * 100;

                return (
                  <div key={product.productName} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 truncate pr-3">{product.productName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{product.totalQuantity} sold</p>
                      </div>
                      <span className="font-black text-slate-950">
                        ₹
                        {product.totalRevenue.toLocaleString('en-IN', {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    {/* Progress Bar Leaderboard */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
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

