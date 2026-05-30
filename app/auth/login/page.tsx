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
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setError(data.error || 'Login failed');
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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Column - Brand & Graphic Showcase (Hidden on Mobile) */}
      <div className="lg:col-span-5 bg-[#08222f] text-white p-12 flex flex-col justify-between hidden lg:flex relative overflow-hidden select-none">
        {/* Branding & Subtitle */}
        <div className="space-y-4 z-10">
          <h1 className="text-3xl font-bold tracking-tight font-sans text-white">
            Nexurah Billing
          </h1>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
            Systematic precision for high-velocity retail environments. Fast, reliable, and built for your growth.
          </p>
        </div>

        {/* Styled Tablet Mockup Graphic Container */}
        <div className="flex-1 flex items-center justify-center py-8 z-10">
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
            {/* Soft back-glow */}
            <div className="absolute inset-0 bg-[#0ea5e9]/10 rounded-full blur-3xl" />
            {/* Graphic image */}
            <img
              src="/login_pos_tablet.png"
              alt="Nexurah Billing POS System"
              className="w-full h-auto object-contain rounded-2xl shadow-2xl border border-white/5 transition-transform duration-700 hover:scale-102 relative z-10"
            />
          </div>
        </div>

        {/* Security Info & Copyright */}
        <div className="space-y-6 z-10">
          {/* Glassmorphism Security Badge */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-start gap-3 max-w-sm shadow-lg">
            <div className="p-1.5 bg-white/10 rounded-lg text-white">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Security Protocol</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-normal">
                Enterprise-grade encryption for every transaction.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-400">
            &copy; 2024 Nexurah POS Systems. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Credentials Form */}
      <div className="lg:col-span-7 bg-[#f8fafc] flex flex-col justify-between p-8 lg:p-16 min-h-screen">
        {/* Empty placeholder for alignment */}
        <div className="hidden lg:block" />

        {/* Login Credentials Box */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-normal">
              Please enter your credentials to access your terminal.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50/85 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2.5 shadow-xs">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 block">
                Email or Username
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@branch.com"
                  className="pr-10 h-10.5 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-sky-500/20 text-slate-900"
                  required
                  disabled={loading}
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4 pointer-events-none" />
              </div>
            </div>

            {/* Password input with forgot link and toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700 block">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#026aa2] hover:text-[#025a8a] hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10 h-10.5 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-sky-500/20 text-slate-900"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
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
              <Checkbox id="remember" className="border-slate-300 rounded-[4px] data-[state=checked]:bg-[#026aa2] data-[state=checked]:border-[#026aa2] cursor-pointer" />
              <label
                htmlFor="remember"
                className="text-xs text-slate-500 font-medium select-none cursor-pointer"
              >
                Keep me logged in on this terminal
              </label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-[#026aa2] hover:bg-[#025a8a] text-white flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer mt-6"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Login <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <Separator className="absolute w-full bg-slate-200/80" />
            <span className="relative px-3 bg-[#f8fafc] text-xs text-slate-400 font-medium">Or</span>
          </div>

          {/* Support button */}
          <button
            type="button"
            className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <HelpCircle className="size-4 text-slate-500" />
            <span>Don&apos;t have an account? Contact Support</span>
          </button>
        </div>

        {/* Footer with links and system status */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#027a48] font-medium bg-[#ecfdf3] px-2.5 py-1 rounded-full border border-[#abefc6]">
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
