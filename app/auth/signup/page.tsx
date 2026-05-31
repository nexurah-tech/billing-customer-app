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
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-900">
      {/* Left Column - Brand & Showcase (Hidden on Mobile) */}
      <div className="lg:col-span-5 bg-[#03050a] text-white p-8 lg:py-12 lg:px-12 flex flex-col justify-between hidden lg:flex relative overflow-hidden select-none border-r border-white/5 h-full">
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
              Create Store Profile
            </h1>
            <p className="text-slate-400 text-[11px] leading-relaxed font-normal max-w-sm">
              Get started in minutes. Setup your store profile, inventory parameters, and deploy your live billing terminal.
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
                Cloud Registration
              </h4>
              <p className="text-[10px] text-slate-400 leading-normal font-light">
                Encrypted terminal deployment & database isolation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form (Natural Full-Page Scrolling) */}
      <div className="lg:col-span-7 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-[#fafbfc] flex flex-col justify-between p-6 sm:p-8 lg:py-8 lg:px-16 relative overflow-y-auto h-full">
        {/* Soft glowing ambient backdrops */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-sky-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* Header - Mobile Logo */}
        <div className="flex justify-between items-center z-10">
          <div className="lg:hidden flex items-center gap-2.5">
            <img 
              src="/logo.png" 
              alt="NexBill Logo" 
              className="w-8 h-8 object-contain rounded-lg bg-white/[0.03] p-1 border border-white/10" 
            />
            <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              Nex<span className="text-sky-400 font-extrabold">Bill</span>
            </span>
          </div>
          <div className="hidden lg:block" />
        </div>

        {/* Register Credentials Box - Centered but offset slightly lower via translate-y-3 */}
        <div className="w-full max-w-lg mx-auto my-auto py-8 z-10 translate-y-3 sm:translate-y-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.06)]">
            <div className="mb-5">
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                Create your terminal account
              </h2>
              <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                Register your retail store branch details below.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-700 text-sm flex items-start gap-2.5 shadow-2xs">
                  <ShieldAlert className="size-4.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name and Email side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Your Full Name
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                      required
                      disabled={loading}
                    />
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@store.com"
                      className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                      required
                      disabled={loading}
                    />
                    <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Shop Name and Phone side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Retail Shop Name
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      placeholder="NexBill Store"
                      className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                      required
                      disabled={loading}
                    />
                    <Store className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                      required
                      disabled={loading}
                    />
                    <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Shop Address */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-slate-700 block">
                  Shop Address
                </label>
                <div className="relative group">
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Shopping Arcade, Sector-4, Mumbai"
                    className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                    required
                    disabled={loading}
                  />
                  <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4.5 peer-focus:text-sky-500 transition-colors pointer-events-none" />
                </div>
              </div>

              {/* Passwords side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                      required
                      disabled={loading}
                    />
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

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 block">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="pr-10 h-11 rounded-xl border-slate-200 bg-white placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-4 focus-visible:ring-sky-500/10 text-slate-900 transition-all duration-200 shadow-2xs peer"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer">
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
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
                    <span>Registering terminal...</span>
                  </div>
                ) : (
                  <>
                    Create Account <ArrowRight className="size-4" />
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

            {/* Support button */}
            <Link href="/auth/login" className="block w-full">
              <button
                type="button"
                className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50/80 rounded-xl text-sm text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs hover:border-slate-300 cursor-pointer">
                <span>Already registered? <span className="text-sky-600 font-bold hover:underline">Sign In to Terminal</span></span>
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
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-600 transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-2 text-[#027a48] font-semibold bg-[#ecfdf3] px-3 py-1.5 rounded-full border border-[#abefc6]/80 shadow-3xs">
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
