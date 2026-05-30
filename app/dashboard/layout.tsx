'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Search, Bell, Clock, Cpu, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [time, setTime] = useState('');
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  // Live Terminal Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch low stock products count
  useEffect(() => {
    if (!authorized) return;

    const fetchLowStockCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success && data.data.products) {
          const lowStockProducts = data.data.products.filter(
            (p: any) => p.stock < (p.reorderLevel || 10)
          );
          setLowStockCount(lowStockProducts.length);
        }
      } catch (err) {
        console.error('Error fetching low stock warning count:', err);
      }
    };

    fetchLowStockCount();
    // Re-check every 30 seconds
    const interval = setInterval(fetchLowStockCount, 30000);
    return () => clearInterval(interval);
  }, [authorized]);

  if (!authorized) {
    return (
      <div className="flex h-screen bg-slate-900 items-center justify-center select-none">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-400 font-medium text-xs tracking-widest uppercase animate-pulse">
            Authenticating POS terminal...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 z-30 select-none">
          {/* Quick Search */}
          <div className="relative w-80 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search POS terminal shortcuts... (Ctrl + K)"
              className="w-full bg-slate-100/60 border border-slate-200/80 rounded-xl pl-9 pr-4 py-1.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              disabled
            />
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-5 ml-auto">
            {/* Live Clock Widget */}
            <div className="flex items-center gap-2 text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/40 text-xs font-mono font-medium shadow-2xs">
              <Clock size={14} className="text-indigo-500" />
              <span>{time || '--:--:-- --'}</span>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/40 text-xs font-semibold">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="hidden md:inline">POS Secure</span>
            </div>

            {/* Low stock notifications bell */}
            <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors">
              <Bell size={18} className="text-slate-600" />
              {lowStockCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative rounded-full h-4 w-4 bg-amber-500 text-[9px] text-white font-bold flex items-center justify-center">
                    {lowStockCount}
                  </span>
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-auto bg-slate-50/35 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

