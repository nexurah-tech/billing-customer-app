'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  Terminal,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Billing POS', href: '/dashboard/billing', icon: ShoppingCart },
  { label: 'Products Catalogue', href: '/dashboard/products', icon: Package },
  { label: 'Customers Registry', href: '/dashboard/customers', icon: Users },
  { label: 'WhatsApp POS', href: '/dashboard/whatsapp', icon: MessageCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [shopName, setShopName] = useState('BillEase POS');
  const [shopEmail, setShopEmail] = useState('cashier@terminal.com');
  const [initials, setInitials] = useState('CP');

  useEffect(() => {
    try {
      const shopData = localStorage.getItem('shop');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        const name = parsed.name || 'Nexurah Shop';
        setShopName(name);
        setShopEmail(parsed.email || 'cashier@terminal.com');
        
        // Extract initials
        const parts = name.split(' ');
        if (parts.length >= 2) {
          setInitials((parts[0][0] + parts[1][0]).toUpperCase());
        } else {
          setInitials(name.substring(0, 2).toUpperCase());
        }
      }
    } catch (err) {
      console.error('Error parsing shop details in sidebar:', err);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('shop');
    window.location.href = '/auth/login';
  };

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen flex flex-col justify-between text-slate-300 font-sans select-none">
      <div>
        {/* Branding badge */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-inner">
            <Terminal size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide leading-none">
              Nexurah <span className="text-indigo-400">BillEase</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              Live POS Terminal
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Handle active checks for exact dashboard and nested pages
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 relative ${
                  isActive
                    ? 'bg-indigo-600/10 text-white border-l-2 border-indigo-500 pl-3.5 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 hover:pl-5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={19} 
                    className={`transition-transform duration-300 group-hover:scale-105 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'
                    }`} 
                  />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-indigo-400 shadow-glow" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Cashier / Terminal Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-4">
        {/* Cashier Profile Card */}
        <div className="flex items-center gap-3 p-2 border border-slate-800/40 rounded-xl bg-slate-900/50 backdrop-blur-sm shadow-xs">
          <div className="size-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md border border-indigo-400/20 tracking-wider">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate flex items-center gap-1">
              <Store size={12} className="text-slate-500" />
              {shopName}
            </h4>
            <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{shopEmail}</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full flex items-center gap-2 justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 border border-slate-800/80 hover:border-red-500/20 h-10 rounded-xl text-xs font-semibold transition-all duration-300"
        >
          <LogOut size={15} />
          Sign out cashier
        </Button>
      </div>
    </div>
  );
}

