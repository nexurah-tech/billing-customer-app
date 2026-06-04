'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Clock,
  CheckCircle2,
  X,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Flow state: 'request' (enter email) or 'reset' (enter OTP and new password)
  const [step, setStep] = useState<'request' | 'reset'>('request');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to send verification code. Please try again.');
        setLoading(false);
        return;
      }
      
      setSuccessMsg(data.data.message || 'OTP verification code sent to your email.');
      setStep('reset');
    } catch (err) {
      setError('An error occurred. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to reset password. Please verify the code.');
        setLoading(false);
        return;
      }
      
      setSuccessMsg('Your password has been successfully reset! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err) {
      setError('An error occurred. Please check your connection.');
      setLoading(false);
    }
  };
  
  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-900">
      
      {/* Left Column - Brand & Showcase (Hidden on Mobile, matching Login) */}
      <div className="lg:col-span-5 bg-[#03050a] text-white p-8 lg:py-12 lg:px-12 flex flex-col justify-between hidden lg:flex relative overflow-hidden select-none border-r border-white/5">
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
              Restore Access Securely
            </h1>
            <p className="text-slate-400 text-[11px] leading-relaxed font-normal max-w-sm">
              Verify your terminal authority using multi-factor mail dispatch OTP tokens before resetting critical credentials.
            </p>
          </div>
        </div>

        {/* Graphic Showcase */}
        <div className="flex-1 flex items-center justify-center py-6 z-10 w-full">
          <div className="relative w-full max-w-[420px] flex items-center justify-center group">
            <div className="absolute inset-0 bg-sky-500/5 rounded-2xl blur-[60px] pointer-events-none" />
            <div className="relative w-full">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur opacity-75" />
              <img 
                src="/login asset.png" 
                alt="NexBill Terminal POS Dashboard" 
                className="relative w-full h-auto object-cover select-none rounded-xl border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                draggable="false"
              />
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="z-10 w-full">
          <div className="bg-[#0b0f19]/40 border border-white/[0.06] backdrop-blur-md p-4 rounded-xl flex items-center gap-3.5 max-w-xs shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">
                OTP Dispatch Engine
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal font-light">
                Secure SMTP relay with 10-minute code validity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Forms container (Fits login page structure) */}
      <div className="lg:col-span-7 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-[#fafbfc] flex flex-col justify-between p-6 sm:p-8 lg:py-5 lg:px-12 relative overflow-hidden h-full">
        
        {/* Soft glowing ambient backdrops */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-sky-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* Header with Mobile Logo */}
        <div className="flex justify-between items-center z-10">
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

        {/* Credentials Form Box */}
        <div className="w-full max-w-md mx-auto my-auto py-2 z-10 translate-y-3 sm:translate-y-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.06)]">
            
            {/* Step 1: Request OTP Form */}
            {step === 'request' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                    <KeyRound className="size-5.5 text-sky-550 shrink-0" />
                    Reset Password
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                    Provide your registered account email to dispatch a 6-digit OTP verification code.
                  </p>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-sm flex items-start gap-2.5 shadow-2xs">
                      <ShieldAlert className="size-4.5 shrink-0 mt-0.5 text-red-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-700 block">
                      Account Email Address
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
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:scale-[1.005] active:scale-[0.99] cursor-pointer mt-4"
                    disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2 justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Dispatching OTP...</span>
                      </div>
                    ) : (
                      <>
                        Send Verification Code <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 2: Verification and Reset Password */}
            {step === 'reset' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                    <KeyRound className="size-5.5 text-sky-550 shrink-0" />
                    Reset Credentials
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                    Check your mailbox for the 6-digit OTP code, then choose your new password.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-sm flex items-start gap-2.5 shadow-2xs">
                      <ShieldAlert className="size-4.5 shrink-0 mt-0.5 text-red-500" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3.5 bg-[#ecfdf3] border border-[#abefc6] rounded-xl text-[#027a48] text-sm flex items-start gap-2.5 shadow-2xs">
                      <CheckCircle2 className="size-4.5 shrink-0 mt-0.5 text-emerald-500" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* OTP Slots input (Premium shadcn design) */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <label className="text-[13px] font-semibold text-slate-700 w-full text-left">
                      Verification Code (OTP)
                    </label>
                    <div className="py-1">
                      <InputOTP
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        disabled={loading}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="w-11 h-11 border border-slate-300 rounded-xl text-lg font-black text-slate-900 bg-white focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 transition-all text-center flex items-center justify-center shadow-2xs" />
                          <InputOTPSlot index={1} className="w-11 h-11 border border-slate-300 rounded-xl text-lg font-black text-slate-900 bg-white focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 transition-all text-center flex items-center justify-center shadow-2xs" />
                          <InputOTPSlot index={2} className="w-11 h-11 border border-slate-300 rounded-xl text-lg font-black text-slate-900 bg-white focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 transition-all text-center flex items-center justify-center shadow-2xs" />
                          <InputOTPSlot index={3} className="w-11 h-11 border border-slate-300 rounded-xl text-lg font-black text-slate-900 bg-white focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 transition-all text-center flex items-center justify-center shadow-2xs" />
                          <InputOTPSlot index={4} className="w-11 h-11 border border-slate-300 rounded-xl text-lg font-black text-slate-900 bg-white focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 transition-all text-center flex items-center justify-center shadow-2xs" />
                          <InputOTPSlot index={5} className="w-11 h-11 border border-slate-300 rounded-xl text-lg font-black text-slate-900 bg-white focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 transition-all text-center flex items-center justify-center shadow-2xs" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  {/* New password input */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-700 block">
                      New Password
                    </label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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

                  {/* Confirm password input */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-700 block">
                      Confirm New Password
                    </label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10 pr-4 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                        required
                        disabled={loading}
                      />
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:scale-[1.005] active:scale-[0.99] cursor-pointer mt-4"
                    disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2 justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      <>
                        Reset Password <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  {/* Go back helper */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('request');
                        setError('');
                        setSuccessMsg('');
                      }}
                      className="text-xs text-sky-600 hover:text-sky-700 hover:underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer focus:outline-none transition-colors"
                      disabled={loading}
                    >
                      <ArrowLeft className="size-3.5" />
                      Change Email Address / Send New Code
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Back to Login link */}
            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80"></div>
              </div>
              <span className="relative px-3.5 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Or
              </span>
            </div>

            <Link href="/auth/login" className="block w-full">
              <button
                type="button"
                className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50/80 rounded-xl text-sm text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs hover:border-slate-300 cursor-pointer"
                disabled={loading}
              >
                <ArrowLeft className="size-4.5 text-sky-500" />
                <span>Go back to <span className="text-sky-600 font-bold hover:underline">Login Page</span></span>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer with links, copyright and system status */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4 mt-auto pt-8 border-t border-slate-100/80 z-10 w-full">
          <div className="flex items-center gap-4">
            <span className="font-light text-slate-400">&copy; 2026 Nexurah</span>
            <span className="text-slate-200 font-light">|</span>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
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
