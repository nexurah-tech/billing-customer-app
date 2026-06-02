'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  Activity,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingUserName, setPendingUserName] = useState('');
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUserName, setBlockedUserName] = useState('');
  const [showRejectedModal, setShowRejectedModal] = useState(false);
  const [rejectedUserName, setRejectedUserName] = useState('');
  
  // Terminal details state
  const [modalShopName, setModalShopName] = useState('');
  const [modalRole, setModalRole] = useState('');
  const [modalPhone, setModalPhone] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [modalBlockReason, setModalBlockReason] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        // If account is blocked, show custom blocked modal
        if (data.status === 'blocked' || (data.error || '').toLowerCase().includes('suspended') || (data.error || '').toLowerCase().includes('blocked')) {
          setBlockedUserName(data.userName || email.split('@')[0]);
          setModalShopName(data.shopName || 'Unknown Shop');
          setModalRole(data.role || 'owner');
          setModalPhone(data.contactPhone || 'N/A');
          setModalEmail(data.contactEmail || email);
          setModalBlockReason(data.blockReason || 'Subscription Payment Overdue');
          setShowBlockedModal(true);
          setLoading(false);
          return;
        }

        // If account is rejected, show custom rejected modal
        if (data.status === 'rejected' || (data.error || '').toLowerCase().includes('rejected')) {
          setRejectedUserName(data.userName || email.split('@')[0]);
          setModalShopName(data.shopName || 'Unknown Shop');
          setModalRole(data.role || 'owner');
          setModalPhone(data.contactPhone || 'N/A');
          setModalEmail(data.contactEmail || email);
          setShowRejectedModal(true);
          setLoading(false);
          return;
        }

        // If account is pending, show friendly modal instead of raw error
        const errMsg = (data.error || '').toLowerCase();
        if (data.status === 'pending' || errMsg.includes('pending') || errMsg.includes('approved') || errMsg.includes('approval')) {
          setPendingUserName(data.userName || email.split('@')[0]);
          setModalShopName(data.shopName || 'Unknown Shop');
          setModalRole(data.role || 'owner');
          setModalPhone(data.contactPhone || 'N/A');
          setModalEmail(data.contactEmail || email);
          setShowPendingModal(true);
          setLoading(false);
          return;
        }
        setError(data.error || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('shop', JSON.stringify(data.data.shop));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const isPaymentReason = modalBlockReason.toLowerCase().includes('payment') || 
                          modalBlockReason.toLowerCase().includes('dues') || 
                          modalBlockReason.toLowerCase().includes('fee') ||
                          modalBlockReason.toLowerCase().includes('overdue') ||
                          modalBlockReason.toLowerCase().includes('pay');

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-900">

      {/* ── Pending Approval Modal Overlay ── */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-lg p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Amber top bar */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />

            <div className="p-10 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                {/* Left Column: Info & Description (7/12 cols) */}
                <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header with inline icon */}
                    <div className="flex items-center gap-5">
                      <div className="size-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-100 p-3.5">
                        <Clock size={32} strokeWidth={2.5} className="animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                          Account Pending Approval
                        </h2>
                        <span className="text-xs md:text-sm text-amber-500 font-extrabold uppercase tracking-widest block mt-1">Authorization Required</span>
                      </div>
                    </div>

                    <p className="text-base md:text-lg text-slate-650 leading-relaxed font-semibold">
                      Hi <strong className="text-slate-900 font-extrabold">{pendingUserName}</strong>! Your registration details for <strong className="text-indigo-700 font-extrabold">{modalShopName}</strong> have been sent to the administrator. We will grant access shortly.
                    </p>

                    <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-6 text-sm md:text-base text-slate-750 leading-relaxed font-medium">
                      Registration requests are handled instantly. Once approved, you will receive an automated WhatsApp confirmation message.
                    </div>
                  </div>
                </div>

                {/* Right Column: Status steps & action (5/12 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between gap-6">
                  {/* Status steps */}
                  <div className="bg-slate-50/80 rounded-2xl p-6 space-y-6 text-left border border-slate-100 flex-1 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border-2 border-emerald-200 mt-0.5">
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-slate-800 leading-tight">Registration Submitted</p>
                        <p className="text-xs md:text-sm text-slate-550 font-semibold mt-1 font-mono">{modalEmail}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border-2 border-amber-200 mt-0.5 animate-pulse">
                        <Clock size={15} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-amber-600 leading-tight">Awaiting Admin Approval</p>
                        <p className="text-xs md:text-sm text-slate-550 font-semibold mt-1">Verifying terminal for {modalShopName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 opacity-45">
                      <div className="size-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border-2 border-slate-200 mt-0.5">
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-slate-600 leading-tight">WhatsApp Confirmation</p>
                        <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1 font-mono">Dispatched to: {modalPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Got it, wait button */}
                  <button
                    onClick={() => setShowPendingModal(false)}
                    className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white text-base font-extrabold rounded-2xl transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <X size={18} />
                    Got it, I&apos;ll wait
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Blocked Account Modal Overlay ── */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-lg p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Red top bar */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-rose-500 to-red-650" />

            <div className="p-10 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                
                {/* Left Column: Suspension info (7/12 cols) */}
                <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header with inline icon */}
                    <div className="flex items-center gap-5">
                      <div className="size-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 shadow-sm border border-red-100 p-3.5">
                        <ShieldAlert size={32} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                          POS Terminal Suspended
                        </h2>
                        <span className="text-xs md:text-sm text-red-500 font-extrabold uppercase tracking-widest block mt-1">Access Restriction Active</span>
                      </div>
                    </div>

                    <p className="text-base md:text-lg text-slate-650 leading-relaxed font-semibold">
                      Hi <strong className="text-slate-900 font-extrabold">{blockedUserName}</strong>! Your branch terminal access for <strong className="text-indigo-700 font-extrabold">{modalShopName}</strong> has been suspended.
                    </p>

                    {/* Highlighted Suspension Reason Block */}
                    <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6 space-y-2 animate-in fade-in duration-200 text-left">
                      <span className="text-xs font-black uppercase tracking-wider text-red-500 block">Suspension Reason</span>
                      <p className="text-base md:text-lg font-black text-red-900 leading-snug">
                        {modalBlockReason}
                      </p>
                    </div>

                    {/* Reactivation warning banner */}
                    {isPaymentReason && (
                      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 flex items-center gap-5 text-left">
                        <div className="size-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 text-white shadow-sm">
                          <CreditCard size={20} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm md:text-base font-extrabold text-amber-800 leading-tight">Please Pay for Approval</h5>
                          <p className="text-xs md:text-sm text-slate-600 font-semibold leading-normal mt-1">Reactivation requires clearing the pending subscription dues of this month.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Status steps & action (5/12 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between gap-6">
                  {/* Status steps */}
                  <div className="bg-slate-50/80 rounded-2xl p-6 space-y-6 text-left border border-slate-100 flex-1 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border-2 border-emerald-200 mt-0.5">
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-slate-800 leading-tight">Terminal Verified</p>
                        <p className="text-xs md:text-sm text-slate-555 font-semibold mt-1 font-mono">{modalEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-red-50 text-red-650 flex items-center justify-center shrink-0 border-2 border-red-200 mt-0.5">
                        <X size={14} className="text-red-600" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-red-650 leading-tight">Access Suspended</p>
                        <p className="text-xs md:text-sm text-red-550 font-semibold mt-1">{modalBlockReason}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border-2 border-amber-200 mt-0.5">
                        <AlertCircle size={15} strokeWidth={2.5} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-amber-650 leading-tight">Helpline Reactivation</p>
                        <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1 font-mono">Contact admin: {modalPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setShowBlockedModal(false)}
                    className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white text-base font-extrabold rounded-2xl transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <X size={18} />
                    Dismiss Notification
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom Rejection Confirmation Modal Overlay ── */}
      {showRejectedModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 backdrop-blur-lg p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Orange/Red top bar */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

            <div className="p-10 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                
                {/* Left Column: Rejection info (7/12 cols) */}
                <div className="md:col-span-7 space-y-6 flex flex-col justify-between">
                  <div className="space-y-6">
                    {/* Header with inline icon */}
                    <div className="flex items-center gap-5">
                      <div className="size-16 rounded-2xl bg-red-50 text-red-655 flex items-center justify-center shrink-0 shadow-sm border border-red-100 p-3.5">
                        <AlertCircle size={32} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                          Registration Rejected
                        </h2>
                        <span className="text-xs md:text-sm text-rose-500 font-extrabold uppercase tracking-widest block mt-1">Authorization Denied</span>
                      </div>
                    </div>

                    <p className="text-base md:text-lg text-slate-650 leading-relaxed font-semibold">
                      Hi <strong className="text-slate-900 font-extrabold">{rejectedUserName}</strong>! Unfortunately, your branch terminal registration request for <strong className="text-indigo-700 font-extrabold">{modalShopName}</strong> has been rejected by our administration.
                    </p>

                    {/* Highlighted Warning Block */}
                    <div className="bg-red-50/60 border border-red-100 rounded-2xl p-6 text-sm md:text-base text-red-800 leading-relaxed font-semibold">
                      Rejection usually occurs due to invalid details, mismatched verification criteria, or service restrictions. Please check with our helpline for detailed reasons.
                    </div>
                  </div>
                </div>

                {/* Right Column: Checklist & action (5/12 cols) */}
                <div className="md:col-span-5 flex flex-col justify-between gap-6">
                  {/* Checklist steps */}
                  <div className="bg-slate-50/80 rounded-2xl p-6 space-y-6 text-left border border-slate-100 flex-1 flex flex-col justify-center">
                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border-2 border-emerald-200 mt-0.5">
                        <CheckCircle2 size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-slate-800 leading-tight">Registration Submitted</p>
                        <p className="text-xs md:text-sm text-slate-555 font-semibold mt-1 font-mono">{modalEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-red-50 text-red-650 flex items-center justify-center shrink-0 border-2 border-red-200 mt-0.5">
                        <X size={14} className="text-red-600" strokeWidth={3} />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-red-650 leading-tight">Request Rejected</p>
                        <p className="text-xs md:text-sm text-red-550 font-semibold mt-1">Branch registration rejected</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="size-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border-2 border-amber-200 mt-0.5">
                        <AlertCircle size={15} strokeWidth={2.5} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm md:text-base font-black text-amber-650 leading-tight">Reactivation Helpline</p>
                        <p className="text-xs md:text-sm text-slate-550 font-semibold mt-1 font-mono">Contact support: {modalPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => setShowRejectedModal(false)}
                    className="w-full py-4 bg-slate-950 hover:bg-slate-800 text-white text-base font-extrabold rounded-2xl transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <X size={18} />
                    Dismiss Notice
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Column - Brand & Showcase (Hidden on Mobile) */}
      <div className="lg:col-span-5 bg-[#03050a] text-white p-8 lg:py-12 lg:px-12 flex flex-col justify-between hidden lg:flex relative overflow-hidden select-none border-r border-white/5">
        {/* Layered Cyber Ambient Glows */}
        <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-sky-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-sky-500/15 to-indigo-500/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Branding & Subtitle */}
        <div className="space-y-6 z-10 w-full">
          <div className="flex items-center gap-3 z-10">
            <img 
              src="/logo.png" 
              alt="NexBill Logo" 
              className="w-10 h-10 object-contain rounded-xl" 
            />
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              Nex<span className="text-sky-400 font-extrabold">Bill</span>
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-350 font-sans leading-tight">
              Precision Retail Billing
            </h1>
            <p className="text-slate-400 text-[11px] leading-relaxed font-normal max-w-sm">
              High-velocity POS engine engineered for terminal speed, secure local database sync, and real-time inventory tracking.
            </p>
          </div>
        </div>

        {/* Graphic Container (Sleek Floating App Window mockup with glow backlight) */}
        <div className="flex-1 flex items-center justify-center py-6 z-10 w-full">
          <div className="relative w-full max-w-[420px] flex items-center justify-center group">
            {/* Soft Ambient Backdrop Glow behind Mockup */}
            <div className="absolute inset-0 bg-sky-500/5 rounded-2xl blur-[60px] pointer-events-none transition-all duration-700 group-hover:bg-sky-500/10" />
            
            {/* Interactive Outer Glowing Frame */}
            <div className="relative w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-350" />
              <img 
                src="/login asset.png" 
                alt="NexBill Terminal POS Dashboard" 
                className="relative w-full h-auto object-cover select-none rounded-xl border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.85)] hover:scale-[1.01] hover:border-white/15 transition-all duration-500 ease-out"
                draggable="false"
              />
            </div>
          </div>
        </div>

        {/* Security Info (Glassmorphic & Premium) */}
        <div className="z-10 w-full">
          <div className="bg-[#0b0f19]/40 border border-white/[0.06] backdrop-blur-md p-4 rounded-xl flex items-center gap-3.5 max-w-xs transition-all duration-300 hover:border-white/10 hover:bg-[#0b0f19]/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.15)] animate-pulse">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">
                Enterprise Protection
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal font-light">
                End-to-end encryption active on this terminal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Credentials Form (Fits full screen) */}
      <div className="lg:col-span-7 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-[#fafbfc] flex flex-col justify-between p-6 sm:p-8 lg:py-5 lg:px-12 relative overflow-hidden h-full">
        {/* Soft glowing ambient backdrops */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-sky-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* Header - Empty on desktop (handled by footer flex), but holds logo on mobile */}
        <div className="flex justify-between items-center z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="NexBill Logo" 
              className="w-9 h-9 object-contain rounded-xl bg-slate-100 border border-slate-200 p-0.5 shadow-sm" 
            />
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              Nex<span className="text-sky-550 font-extrabold">Bill</span>
            </span>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Login Credentials Box (With card border) - Moved slightly down using translate-y */}
        <div className="w-full max-w-md mx-auto my-auto py-2 z-10 translate-y-3 sm:translate-y-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.06)]">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                Enter your credentials below to access your branch terminal.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-sm flex items-start gap-2.5 shadow-2xs">
                  <ShieldAlert className="size-4.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 block">
                  Email or Username
                </label>
                <div className="relative group">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@branch.com"
                    className="pl-10 pr-4 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                    required
                    disabled={loading}
                  />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                </div>
              </div>

              {/* Password input with forgot link and toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-sky-600 hover:text-sky-700 hover:underline font-semibold transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                    required
                    disabled={loading}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Keep me logged in checkbox */}
              <div className="flex items-center space-x-2.5 pt-1">
                <Checkbox
                  id="remember"
                  className="border-slate-300 rounded-[4px] data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600 cursor-pointer transition-all"
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-slate-500 font-medium select-none cursor-pointer">
                  Keep me logged in on this terminal
                </label>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 text-white flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.25)] hover:scale-[1.005] active:scale-[0.99] cursor-pointer mt-4"
                disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    Login <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80"></div>
              </div>
              <span className="relative px-3.5 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or
              </span>
            </div>

            {/* Register link */}
            <Link href="/auth/signup" className="block w-full">
              <button
                type="button"
                className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50/80 rounded-xl text-sm text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs hover:border-slate-300 cursor-pointer">
                <HelpCircle className="size-4.5 text-sky-500" />
                <span>Don&apos;t have an account? <span className="text-sky-600 font-bold hover:underline">Create Account</span></span>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer with links, copyright and system status */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4 mt-auto pt-8 border-t border-slate-100/80 z-10 w-full">
          <div className="flex items-center gap-4">
            <span className="font-light text-slate-400">&copy; 2026 Nexurah</span>
            <span className="text-slate-200 font-light">|</span>
            <Link
              href="/privacy"
              className="hover:text-slate-600 transition-colors">
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-600 transition-colors">
              Terms
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#027a48] font-semibold bg-[#ecfdf3] px-3 py-1.5 rounded-full border border-[#abefc6]/80 shadow-3xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            All Systems Operational
          </div>
        </div>
      </div>
    </div>
  );
}
