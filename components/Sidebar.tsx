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
  Store,
  ChevronRight,
  Zap,
} from 'lucide-react';

const primaryNav = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { label: 'Quick Bill POS', href: '/dashboard/quickbill', icon: Zap },
  { label: 'Billing POS', href: '/dashboard/billing', icon: ShoppingCart },
  { label: 'Products Catalogue', href: '/dashboard/products', icon: Package },
  { label: 'Customers Registry', href: '/dashboard/customers', icon: Users },
];

const secondaryNav = [
  { label: 'WhatsApp POS', href: '/dashboard/whatsapp', icon: MessageCircle },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [shopName, setShopName] = useState('NexBill Shop');
  const [shopEmail, setShopEmail] = useState('cashier@terminal.com');
  const [initials, setInitials] = useState('NB');

  useEffect(() => {
    try {
      const shopData = localStorage.getItem('shop');
      if (shopData) {
        const parsed = JSON.parse(shopData);
        const name = parsed.name || 'NexBill Shop';
        setShopName(name);
        setShopEmail(parsed.email || 'cashier@terminal.com');
        const parts = name.trim().split(' ');
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

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const NavItem = ({ item }: { item: { label: string; href: string; icon: any } }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
          active
            ? 'bg-sky-500/10 text-white border border-sky-500/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
        }`}
      >
        {/* Active left bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-sky-400" />
        )}

        <div className="flex items-center gap-3 pl-1">
          <div className={`p-1.5 rounded-lg transition-all duration-200 ${
            active
              ? 'bg-sky-500/15 text-sky-400'
              : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-white/[0.05]'
          }`}>
            <Icon size={15} />
          </div>
          <span className={`text-[13px] font-semibold tracking-wide ${
            active ? 'text-white' : 'group-hover:text-slate-200'
          }`}>
            {item.label}
          </span>
        </div>

        <ChevronRight
          size={12}
          className={`transition-all duration-200 ${
            active
              ? 'text-sky-400 opacity-100'
              : 'text-slate-600 opacity-0 group-hover:opacity-60'
          }`}
        />
      </Link>
    );
  };

  return (
    <div className="w-64 h-screen bg-[#03050a] border-r border-white/5 flex flex-col text-slate-300 font-sans select-none relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-[250px] h-[250px] bg-sky-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none" />

      {/* ── Branding ── */}
      <div className="relative z-10 shrink-0 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="NexBill Logo"
            className="w-10 h-10 object-contain rounded-xl bg-white/5 border border-white/10 p-0.5"
          />
          <div>
            <span className="text-[18px] font-bold tracking-tight text-white leading-none">
              Nex<span className="text-sky-400 font-extrabold">Bill</span>
            </span>
            <p className="text-[10.5px] text-slate-500 mt-1 font-normal tracking-wide">
              Retail POS Platform
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav — flex-1, NO scroll, content spread top↔bottom ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-3 py-4 overflow-hidden">
        {/* Primary — sits at top */}
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.15em] font-bold px-2 mb-2">
            Main Menu
          </p>
          <div className="space-y-0.5">
            {primaryNav.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Secondary — sits at bottom */}
        <div>
          <div className="border-t border-white/[0.05] mx-1 mb-3" />
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.15em] font-bold px-2 mb-2">
            Tools
          </p>
          <div className="space-y-0.5">
            {secondaryNav.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer — always pinned ── */}
      <div className="relative z-10 shrink-0 border-t border-white/5 p-3 space-y-2">
        {/* Shop card */}
        <div className="bg-[#0b0f19]/40 border border-white/[0.06] backdrop-blur-md px-3 py-2.5 rounded-xl flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-[10px] tracking-wider shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-semibold text-slate-200 truncate flex items-center gap-1.5">
              <Store size={10} className="text-slate-500 shrink-0" />
              {shopName}
            </h4>
            <p className="text-[9.5px] text-slate-500 truncate font-mono mt-0.5">
              {shopEmail}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 justify-center px-4 py-2 rounded-xl text-[11.5px] font-semibold text-slate-500 hover:text-red-400 hover:bg-red-500/8 border border-white/[0.05] hover:border-red-500/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={12} />
          Sign out cashier
        </button>
      </div>
    </div>
  );
}
