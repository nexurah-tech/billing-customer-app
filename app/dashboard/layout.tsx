'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Search, Bell, Clock, Cpu, ShieldCheck, AlertCircle, Info, Sparkles, Check, CheckCircle2, CreditCard, X, GripHorizontal, Wifi, WifiOff } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

const NAVIGATION_SHORTCUTS = [
  { label: 'Dashboard Overview', href: '/dashboard', description: 'Overview and sales metrics' },
  { label: 'Detailed Analytics', href: '/dashboard/analytics', description: 'Detailed sales performance reports' },
  { label: 'Quick Bill POS', href: '/dashboard/quickbill', description: 'Fast cashier checkout' },
  { label: 'Billing POS', href: '/dashboard/billing', description: 'Standard billing point-of-sale' },
  { label: 'Products Catalogue', href: '/dashboard/products', description: 'Manage inventory, categories, and stock' },
  { label: 'Customers Registry', href: '/dashboard/customers', description: 'View and manage customer profiles' },
  { label: 'WhatsApp POS Gateway', href: '/dashboard/whatsapp', description: 'WhatsApp notifications integration' },
  { label: 'Terminal Settings', href: '/dashboard/settings', description: 'Terminal configurations and receipts' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [authorized, setAuthorized] = useState(false);
  const [time, setTime] = useState('');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<'offline' | 'weak' | 'good' | 'strong'>('strong');
  const [dismissedOffline, setDismissedOffline] = useState(false);
  const [dontShowAgainState, setDontShowAgainState] = useState(false);
  const [noOfflinePopup, setNoOfflinePopup] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNoOfflinePopup(localStorage.getItem('noOfflinePopup') === 'true');
    }
  }, []);

  useEffect(() => {
    if (networkStatus !== 'offline') {
      setDismissedOffline(false);
    }
  }, [networkStatus]);

  // Register online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('strong');
    };
    const handleOffline = () => {
      setNetworkStatus('offline');
    };

    if (typeof window !== 'undefined') {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
      }
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Shortcut search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter shortcuts
  const filteredShortcuts = searchQuery.trim()
    ? NAVIGATION_SHORTCUTS.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : NAVIGATION_SHORTCUTS;

  // Global key listener for Ctrl + K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutsideSearch = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch);
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev + 1) % filteredShortcuts.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchSelectedIndex((prev) => (prev - 1 + filteredShortcuts.length) % filteredShortcuts.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredShortcuts[searchSelectedIndex]) {
        router.push(filteredShortcuts[searchSelectedIndex].href);
        setShowSearchDropdown(false);
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchDropdown(false);
      searchInputRef.current?.blur();
    }
  };

  // Real-time status & notifications states
  const [status, setStatus] = useState<'pending' | 'active' | 'blocked' | 'inactive'>('active');
  const [statusChecked, setStatusChecked] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');
  const [subscription, setSubscription] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const notificationsRef = useRef<any[]>([]);
  const isInitialFetchRef = useRef(true);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Draggable, resizable floating notification window state
  const [activeNotification, setActiveNotification] = useState<any | null>(null);
  const [windowPosition, setWindowPosition] = useState({ x: 380, y: 100 });
  const [windowSize, setWindowSize] = useState({ width: 380, height: 260 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  // Mouse Drag Handler
  const startDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.close-btn-popup')) return;
    e.preventDefault();
    setDragging(true);

    const startX = e.clientX - windowPosition.x;
    const startY = e.clientY - windowPosition.y;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setWindowPosition({
        x: moveEvent.clientX - startX,
        y: moveEvent.clientY - startY,
      });
    };

    const onMouseUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Mouse Resize Handler
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);

    const startWidth = windowSize.width;
    const startHeight = windowSize.height;
    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(320, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(220, startHeight + (moveEvent.clientY - startY));
      setWindowSize({
        width: newWidth,
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      setResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

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
        const response = await apiFetch('/api/products', {
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

  // Fetch user status
  useEffect(() => {
    if (!authorized) return;

    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const startTime = performance.now();
        const response = await apiFetch('/api/auth/status', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const endTime = performance.now();
        const latency = endTime - startTime;

        if (response.ok) {
          if (latency < 150) {
            setNetworkStatus('strong');
          } else if (latency < 400) {
            setNetworkStatus('good');
          } else {
            setNetworkStatus('weak');
          }
        } else {
          setNetworkStatus('weak');
        }

        const data = await response.json();
        if (data.success) {
          setStatus(data.data.status);
          setBlockReason(data.data.blockReason || '');
          setSubscription(data.data.subscription || null);
        }
      } catch (err) {
        console.error('Error checking user status:', err);
        setNetworkStatus('offline');
      } finally {
        setStatusChecked(true);
      }
    };

    checkUserStatus();
    const interval = setInterval(checkUserStatus, 15000); // Check status every 15s for instant response
    return () => clearInterval(interval);
  }, [authorized]);

  // Fetch admin notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const startTime = performance.now();
      const response = await apiFetch(`/api/notifications?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const endTime = performance.now();
      const latency = endTime - startTime;

      if (response.ok) {
        if (latency < 150) {
          setNetworkStatus('strong');
        } else if (latency < 400) {
          setNetworkStatus('good');
        } else {
          setNetworkStatus('weak');
        }
      } else {
        setNetworkStatus('weak');
      }

      const data = await response.json();
      if (data.success) {
        const fetchedNotifs = data.data.notifications || [];

        // Check if there are any new unread notifications compared to our current list
        const newUnreadNotifs = fetchedNotifs.filter((n: any) => {
          const isAlreadyKnown = notificationsRef.current.some((existing) => existing.id === n.id);
          return !isAlreadyKnown && !n.isRead;
        });

        setNotifications(fetchedNotifs);
        setUnreadNotificationsCount(data.data.unreadCount);

        // If it's not the initial load fetch and we found new unread notifications, trigger alert
        if (!isInitialFetchRef.current && newUnreadNotifs.length > 0) {
          const audio = new Audio('/notification-sound_1.mp3');
          audio.play().catch((err) => {
            console.warn('Audio playback failed or blocked by browser policies:', err);
          });

          // Set the latest new notification as active to open the floating window
          setActiveNotification(newUnreadNotifs[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
      setNetworkStatus('offline');
    } finally {
      isInitialFetchRef.current = false;
    }
  };

  useEffect(() => {
    if (!authorized) return;
    isInitialFetchRef.current = true;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s for real-time notifications
    return () => clearInterval(interval);
  }, [authorized]);

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(
          notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        setUnreadNotificationsCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Click outside notification dropdown handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Handle suspended/pending accounts with beautiful full-page overlays
  if (statusChecked && (status === 'blocked' || status === 'pending')) {
    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('shop');
      router.replace('/auth/login');
    };

    const isSubscriptionBlock = status === 'blocked' && blockReason === 'Subscription Payment Overdue';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 select-none">
        <div className={`w-full ${isSubscriptionBlock ? 'max-w-lg' : 'max-w-md'} p-8 bg-white border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-5 animate-in zoom-in-95 duration-200`}>
          {status === 'blocked' ? (
            isSubscriptionBlock ? (
              <>
                <div className="size-16 rounded-2xl bg-red-50 text-red-650 flex items-center justify-center shadow-xs">
                  <CreditCard size={32} strokeWidth={2} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">POS Terminal Locked</h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    Your monthly subscription has expired and has passed the 3-day grace period. To restore billing functionality, please scan the QR code to pay, then send your transaction details/screenshot to WhatsApp.
                  </p>
                </div>

                {subscription?.paymentQrCodeUrl && (
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col items-center space-y-3">
                    <img 
                      src={subscription.paymentQrCodeUrl} 
                      alt="UPI QR Code" 
                      className="size-48 object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-2xs" 
                    />
                    <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Payment Link</p>
                      <p className="text-xs font-mono font-black text-indigo-600">{subscription.whatsappNumber}</p>
                    </div>
                  </div>
                )}

                <div className="w-full flex gap-3 pt-2">
                  <a
                    href={`https://wa.me/${(subscription?.whatsappNumber || '919600950190').replace(/[^0-9]/g, '')}?text=Hi%20Admin,%20I%20have%20sent%20payment%20for%20my%20billing%2520terminal%20subscription.%20Here%20is%20the%20screenshot.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Send Screenshot via WhatsApp
                  </a>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all border border-slate-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="size-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
                  <AlertCircle size={32} strokeWidth={2} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">POS Terminal Suspended</h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Your billing terminal access has been suspended due to administrative reasons. Please contact NexBill administrator at <strong className="text-indigo-600">admin@nexurah.com</strong>.
                  </p>
                </div>
                <div className="w-full pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    Sign Out Account
                  </button>
                </div>
              </>
            )
          ) : (
            <>
              <div className="size-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <Clock size={32} strokeWidth={2} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Pending Admin Approval</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Thank you for registering at NexBill. Your terminal account is currently pending approval by the super administrator. Access will be enabled shortly once your shop profile is verified.
                </p>
              </div>
              <div className="w-full pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Sign Out Account
                </button>
              </div>
            </>
          )}
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
          <div ref={searchContainerRef} className="relative w-80 hidden sm:block z-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search POS shortcuts... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchSelectedIndex(0);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={handleSearchKeyDown}
              className="w-full bg-slate-100/60 border border-slate-200/80 rounded-xl pl-9 pr-4 py-1.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/85 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-250 select-none">
                <div className="px-4.5 py-2.5 bg-slate-50 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <span>POS Shortcuts</span>
                  <span className="font-mono text-[9px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 lowercase">Esc to close</span>
                </div>
                <div className="p-1.5 space-y-0.5">
                  {filteredShortcuts.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-slate-400 font-bold">
                      No matching shortcuts found
                    </div>
                  ) : (
                    filteredShortcuts.map((s, idx) => {
                      const isSelected = idx === searchSelectedIndex;
                      return (
                        <div
                          key={s.href}
                          onClick={() => {
                            router.push(s.href);
                            setShowSearchDropdown(false);
                            setSearchQuery('');
                          }}
                          onMouseEnter={() => setSearchSelectedIndex(idx)}
                          className={`px-3.5 py-2 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors duration-150 ${
                            isSelected
                              ? 'bg-slate-100 text-slate-950 font-bold'
                              : 'text-slate-650 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-black text-slate-800">{s.label}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{s.description}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 transition-colors ${
                            isSelected ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                          }`}>
                            Open
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Status Actions */}
          <div className="flex items-center gap-5 ml-auto">
            {/* Live Clock Widget */}
            <div className="flex items-center gap-2 text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/40 text-xs font-mono font-medium shadow-2xs">
              <Clock size={14} className="text-indigo-500" />
              <span>{time || '--:--:-- --'}</span>
            </div>

            {/* WiFi / Network Signal Strength Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold select-none transition-all duration-300 ${
              networkStatus === 'strong'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-200/40'
                : networkStatus === 'good'
                ? 'text-amber-600 bg-amber-50 border-amber-200/40'
                : networkStatus === 'weak'
                ? 'text-rose-600 bg-rose-50 border-rose-200/40'
                : 'text-red-600 bg-red-50 border-red-200/40'
            }`}>
              {networkStatus === 'offline' ? (
                <WifiOff size={14} className="text-red-500 animate-pulse" />
              ) : (
                <Wifi size={14} className={
                  networkStatus === 'strong'
                    ? 'text-emerald-500'
                    : networkStatus === 'good'
                    ? 'text-amber-500'
                    : 'text-rose-500 animate-pulse'
                } />
              )}
              <span className="hidden md:inline">
                {networkStatus === 'strong' && 'Signal: Strong'}
                {networkStatus === 'good' && 'Signal: Good'}
                {networkStatus === 'weak' && 'Signal: Weak'}
                {networkStatus === 'offline' && 'Offline'}
              </span>
            </div>

            {/* Real-time Notifications bell & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-xl transition-colors select-none"
              >
                <Bell size={18} className="text-slate-600 animate-none" />
                {(unreadNotificationsCount > 0 || lowStockCount > 0) && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative rounded-full h-4 w-4 bg-indigo-600 text-[9px] text-white font-bold flex items-center justify-center">
                      {unreadNotificationsCount + (lowStockCount > 0 ? 1 : 0)}
                    </span>
                  </span>
                )}
              </div>

              {/* Floating Dropdown */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 bg-slate-50 flex items-center justify-between select-none">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">POS Terminal Alerts</span>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-indigo-600 hover:text-indigo-700 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 size={11} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Scrollable Area */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 no-scrollbar">
                    {/* Low Stock alert merged into list */}
                    {lowStockCount > 0 && (
                      <div className="p-3.5 hover:bg-slate-50/50 flex gap-3 text-[11px] leading-relaxed transition-colors select-none">
                        <div className="size-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                          <AlertCircle size={14} />
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <p className="font-extrabold text-slate-800">Inventory Alert</p>
                          <p className="text-slate-400 font-semibold leading-normal">
                            You have {lowStockCount} items running below reorder thresholds.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Admin notifications */}
                    {notifications.length === 0 && lowStockCount === 0 ? (
                      <div className="p-8 text-center text-slate-400 font-bold select-none text-[11px]">
                        No system messages logged.
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isPay = notif.type === 'payment';
                        const isAlert = notif.type === 'alert';
                        const Icon = isPay ? CreditCard : isAlert ? AlertCircle : Info;
                        const iconBg = isPay ? 'bg-red-50 text-red-600' : isAlert ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600';
                        
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              setActiveNotification(notif);
                              if (!notif.isRead) {
                                markAsRead(notif.id);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50/50 flex gap-3 text-[11px] leading-relaxed transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-indigo-50/[0.08]' : ''}`}
                          >
                            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}>
                              <Icon size={14} />
                            </div>
                            <div className="space-y-0.5 flex-1 pr-3">
                              <p className="font-extrabold text-slate-800 flex items-center justify-between">
                                {notif.title}
                                {!notif.isRead && (
                                  <span className="size-1.5 rounded-full bg-indigo-600 shrink-0 self-center" />
                                )}
                              </p>
                              <p className="text-slate-505 font-medium leading-normal mt-0.5 truncate max-w-[200px]">{notif.message}</p>
                              <p className="text-[9.5px] text-slate-450 font-semibold mt-1">
                                {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-auto bg-slate-50/35 relative flex flex-col">
          {subscription?.isGracePeriod && (
            <div className="bg-amber-600 text-white px-8 py-3.5 text-xs font-bold flex flex-col sm:flex-row gap-3 sm:items-center justify-between shadow-md select-none animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={16} className="animate-pulse shrink-0 text-amber-250" />
                <span className="leading-relaxed">
                  Your monthly subscription has expired! You are currently in a <strong>3-day grace period</strong>. 
                  Please complete payment within <strong>{subscription.graceDaysLeft} day(s)</strong> to prevent terminal lockout.
                </span>
              </div>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="bg-white hover:bg-slate-100 text-amber-800 text-[10.5px] font-black px-4.5 py-2 rounded-xl transition-all shadow-xs self-start sm:self-auto cursor-pointer"
              >
                Pay Renewal Fee
              </button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      {/* ── Fixed Side Notification Popup Card ── */}
      {activeNotification && (
        <div
          className="fixed top-20 right-6 w-80 sm:w-[350px] bg-slate-950/95 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md z-50 flex flex-col animate-in slide-in-from-right-8 fade-in duration-300"
        >
          {/* Header */}
          <div className="h-11 px-4.5 bg-slate-900 border-b border-slate-800/60 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                System Broadcast
              </span>
            </div>
            
            <button
              onClick={() => setActiveNotification(null)}
              className="close-btn-popup p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer active:scale-90"
            >
              <X size={13} />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5 space-y-4">
            <div className="space-y-1 select-text">
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider select-none ${
                activeNotification.type === 'payment'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : activeNotification.type === 'alert'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {activeNotification.type || 'info'}
              </span>
              <h3 className="text-sm font-black text-white leading-snug tracking-tight">
                {activeNotification.title}
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed select-text whitespace-pre-wrap">
              {activeNotification.message}
            </p>

            <div className="pt-2 border-t border-slate-900/60 flex justify-between items-center text-[9px] font-semibold text-slate-500 select-none">
              <span>NexBill Bulletin Engine</span>
              <span className="font-mono">
                {new Date(activeNotification.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* ── Offline Connectivity Warning Modal ── */}
      {networkStatus === 'offline' && !dismissedOffline && !noOfflinePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 print:hidden select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md p-8 bg-white border border-slate-200/80 rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="size-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs animate-bounce">
              <WifiOff size={32} strokeWidth={2} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Connection Offline</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                NexBill detected that your terminal is currently disconnected from the internet. Transactions, invoices, and live inventory sync are temporarily paused. You can continue creating bills in offline mode, and they will sync once the connection is restored.
              </p>
            </div>

            <div className="w-full flex items-center gap-2 pl-1 select-none">
              <input
                id="dontShowAgain"
                type="checkbox"
                checked={dontShowAgainState}
                onChange={(e) => setDontShowAgainState(e.target.checked)}
                className="size-4 rounded border-slate-350 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="dontShowAgain" className="text-xs text-slate-500 font-bold cursor-pointer select-none">
                Don't show this alert again
              </label>
            </div>

            <div className="w-full flex gap-3 pt-2">
              <button
                onClick={() => {
                  if (dontShowAgainState) {
                    localStorage.setItem('noOfflinePopup', 'true');
                    setNoOfflinePopup(true);
                  }
                  setDismissedOffline(true);
                }}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all border border-slate-200 cursor-pointer flex-1"
              >
                Dismiss & Continue
              </button>
              <button
                onClick={async () => {
                  // Trigger immediate recheck
                  try {
                    const token = localStorage.getItem('token');
                    const startTime = performance.now();
                    const response = await apiFetch('/api/auth/status', {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const endTime = performance.now();
                    const latency = endTime - startTime;
                    if (response.ok) {
                      if (latency < 150) setNetworkStatus('strong');
                      else if (latency < 400) setNetworkStatus('good');
                      else setNetworkStatus('weak');
                    }
                  } catch {
                    // Still offline
                  }
                }}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-98 cursor-pointer flex-1"
              >
                Check Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

