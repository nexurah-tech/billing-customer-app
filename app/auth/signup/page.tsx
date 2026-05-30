'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Store,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    shopName: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          shopName: formData.shopName,
          phone: formData.phone,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      // Store token
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
            NexBill
          </h1>
          <p className="text-slate-300 text-sm max-w-sm leading-relaxed">
            Get started in minutes. Setup your store profile, inventory
            parameters, and deploy your live billing terminal.
          </p>
        </div>

        {/* Tablet Mockup Graphic Container */}
        <div className="flex-1 flex items-center justify-center py-8 z-10">
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
            {/* Soft back-glow */}
            <div className="absolute inset-0 bg-[#0ea5e9]/10 rounded-full blur-3xl" />
            {/* Graphic image */}
            <img
              src="/login_pos_tablet.png"
              alt="NexBill POS System"
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
              <h4 className="text-sm font-semibold text-white">
                Cloud Registration
              </h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-normal">
                Encrypted terminal deployment & database isolation.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-400">
            &copy; 2026 NexBill Systems. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="lg:col-span-7 bg-[#f8fafc] flex flex-col justify-between p-8 lg:p-16 min-h-screen">
        {/* Top Navbar */}
        <div className="hidden lg:block" />

        {/* Register Credentials Box */}
        <div className="w-full max-w-lg mx-auto my-auto py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Create your terminal account
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 font-normal">
              Register your retail store branch details below.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3.5 bg-red-50/85 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2.5 shadow-xs">
                <ShieldAlert className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Your Full Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                    required
                    disabled={loading}
                  />
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@store.com"
                    className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shop Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Retail Shop Name
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="NexBill Store"
                    className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                    required
                    disabled={loading}
                  />
                  <Store className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Phone Number
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                    required
                    disabled={loading}
                  />
                  <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 block">
                Shop Address
              </label>
              <div className="relative">
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Shopping Arcade, Sector-4, Mumbai"
                  className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                  required
                  disabled={loading}
                />
                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
                    {showPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pr-10 h-10 rounded-lg border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 text-slate-900 text-xs"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
                    {showConfirmPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer mt-6"
              disabled={loading}>
              {loading ? (
                "Registering terminal..."
              ) : (
                <>
                  Create Account <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <Separator className="absolute w-full bg-slate-200/80" />
            <span className="relative px-3 bg-[#f8fafc] text-xs text-slate-400 font-medium">
              Or
            </span>
          </div>

          {/* Login button */}
          <Link href="/auth/login" className="block text-center">
            <Button
              type="button"
              variant="outline"
              className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-sm text-slate-600 font-medium flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs cursor-pointer">
              <span>Already registered? Sign In to Terminal</span>
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 mt-auto pt-8 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="hover:text-slate-600 transition-colors">
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-600 transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#027a48] font-medium bg-[#ecfdf3] px-2.5 py-1 rounded-full border border-[#abefc6]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            Terminal Operational
          </div>
        </div>
      </div>
    </div>
  );
}

