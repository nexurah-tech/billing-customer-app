'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Eye,
  EyeOff,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

// ─── Password strength checker ────────────────────────────────────────────────
function getPasswordChecks(password: string) {
  return {
    length:  password.length >= 8,
    number:  /[0-9]/.test(password),
    symbol:  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
    upper:   /[A-Z]/.test(password),
  };
}

// ─── Email validator ───────────────────────────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Phone validator ──────────────────────────────────────────────────────────
function isValidPhone(phone: string) {
  return /^[0-9]{10}$/.test(phone);
}

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
  const [signupSuccess, setSignupSuccess] = useState(false);

  // ─── Field-level touched state for validation UX ──────────────────────────
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (name: string) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  // ─── Phone: only allow digits, max 10 ────────────────────────────────────
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    markTouched('phone');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    markTouched(name);
  };

  // ─── Derived validation flags ─────────────────────────────────────────────
  const phoneInvalid  = touched.phone  && formData.phone.length > 0 && !isValidPhone(formData.phone);
  const phoneDone     = isValidPhone(formData.phone);

  const emailInvalid  = touched.email  && formData.email.length > 0 && !isValidEmail(formData.email);
  const emailDone     = isValidEmail(formData.email);

  const pwChecks     = getPasswordChecks(formData.password);
  const pwAllPassed  = pwChecks.length && pwChecks.number && pwChecks.symbol;
  const showPwHints  = touched.password && formData.password.length > 0;

  const confirmMismatch = touched.confirmPassword && formData.confirmPassword.length > 0
    && formData.password !== formData.confirmPassword;

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!isValidPhone(formData.phone)) {
      setError('Phone number must be exactly 10 digits. No spaces or letters allowed.');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address (e.g. john@store.com).');
      return;
    }
    if (!pwAllPassed) {
      setError('Password must be at least 8 characters and include a number and a symbol.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/api/auth/signup', {
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
        setError(data.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSignupSuccess(true);
    } catch (err) {
      setError('Unable to connect to the server. Please check your internet and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-900">
      {/* Left Column - Brand & Showcase */}
      <div className="lg:col-span-5 bg-[#03050a] text-white p-8 lg:py-12 lg:px-12 flex flex-col justify-between hidden lg:flex relative overflow-hidden select-none border-r border-white/5 h-full">
        <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-sky-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-indigo-500/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-sky-500/15 to-indigo-500/15 rounded-full blur-[110px] pointer-events-none" />

        <div className="space-y-6 z-10 w-full">
          <div className="flex items-center gap-3 z-10">
            <img src="/logo.png" alt="NexBill Logo" className="w-10 h-10 object-contain rounded-xl" />
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

        <div className="flex-1 flex items-center justify-center py-6 z-10 w-full">
          <div className="relative w-full max-w-[420px] flex items-center justify-center group">
            <div className="absolute inset-0 bg-sky-500/5 rounded-2xl blur-[60px] pointer-events-none transition-all duration-700 group-hover:bg-sky-500/10" />
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

        <div className="z-10 w-full">
          <div className="bg-[#0b0f19]/40 border border-white/[0.06] backdrop-blur-md p-4 rounded-xl flex items-center gap-3.5 max-w-xs transition-all duration-300 hover:border-white/10 hover:bg-[#0b0f19]/60 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(14,165,233,0.15)] animate-pulse">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-200">Cloud Registration</h4>
              <p className="text-[10px] text-slate-400 leading-normal font-light">
                Encrypted terminal deployment & database isolation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="lg:col-span-7 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] bg-[#fafbfc] flex flex-col justify-between p-6 sm:p-8 lg:py-8 lg:px-16 relative overflow-y-auto h-full">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-sky-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/[0.02] rounded-full blur-[100px] pointer-events-none" />

        {/* Mobile Logo */}
        <div className="flex justify-between items-center z-10">
          <div className="lg:hidden flex items-center gap-2.5">
            <img src="/logo.png" alt="NexBill Logo" className="w-8 h-8 object-contain rounded-lg bg-white/[0.03] p-1 border border-white/10" />
            <span className="text-lg font-bold tracking-tight text-slate-900 font-sans">
              Nex<span className="text-sky-400 font-extrabold">Bill</span>
            </span>
          </div>
          <div className="hidden lg:block" />
        </div>

        <div className="w-full max-w-lg mx-auto my-auto py-8 z-10 translate-y-3 sm:translate-y-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-[0_15px_50px_-12px_rgba(0,0,0,0.06)]">
            {signupSuccess ? (
              <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
                <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} strokeWidth={2} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Registration Received!</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Thank you for registering at NexBill. Your terminal account has been created successfully.
                    Your profile is currently <strong>pending approval</strong> by the super administrator.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Once approved, an automated WhatsApp confirmation will be dispatched to your contact number{' '}
                    <strong className="text-sky-600 font-black">{formData.phone}</strong>. You will then be able to log in.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Link href="/auth/login" className="block w-full">
                    <Button className="w-full bg-slate-950 hover:bg-slate-900 text-white flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-98 cursor-pointer">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                    Create your terminal account
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-normal leading-relaxed">
                    Register your retail store branch details below.
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Error banner */}
                  {error && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs flex items-start gap-2.5 shadow-2xs animate-in slide-in-from-top-1 duration-150">
                      <ShieldAlert className="size-4 shrink-0 mt-0.5 text-red-500" />
                      <span className="font-medium leading-relaxed">{error}</span>
                    </div>
                  )}

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-slate-700 block">Your Full Name</label>
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

                    {/* Email with live validation */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-slate-700 block">Email Address</label>
                      <div className="relative group">
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => markTouched('email')}
                          placeholder="john@store.com"
                          className={`pr-10 h-11 rounded-xl bg-white placeholder:text-slate-400 text-slate-900 transition-all duration-200 shadow-2xs peer focus-visible:ring-4 ${
                            emailInvalid
                              ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10 bg-red-50'
                              : emailDone
                              ? 'border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10'
                              : 'border-slate-200 focus-visible:border-sky-500 focus-visible:ring-sky-500/10'
                          }`}
                          required
                          disabled={loading}
                        />
                        <Mail className={`absolute right-3.5 top-1/2 -translate-y-1/2 size-4.5 pointer-events-none transition-colors ${
                          emailInvalid ? 'text-red-400' : emailDone ? 'text-emerald-500' : 'text-slate-400 peer-focus:text-sky-500'
                        }`} />
                      </div>
                      {emailInvalid && (
                        <p className="text-[10.5px] text-red-500 font-semibold flex items-center gap-1 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                          <ShieldAlert size={10} className="shrink-0" />
                          Enter a valid email (e.g. name@store.com)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shop Name + Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-slate-700 block">Retail Shop Name</label>
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

                    {/* Phone — numbers only, max 10, red on invalid */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-slate-700 block">Phone Number</label>
                      <div className="relative group">
                        <Input
                          type="tel"
                          name="phone"
                          inputMode="numeric"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          onBlur={() => markTouched('phone')}
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          className={`pr-10 h-11 rounded-xl bg-white placeholder:text-slate-400 text-slate-900 transition-all duration-200 shadow-2xs peer focus-visible:ring-4 font-mono tracking-wider ${
                            phoneInvalid
                              ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10 bg-red-50'
                              : phoneDone
                              ? 'border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10'
                              : 'border-slate-200 focus-visible:border-sky-500 focus-visible:ring-sky-500/10'
                          }`}
                          required
                          disabled={loading}
                        />
                        <Phone className={`absolute right-3.5 top-1/2 -translate-y-1/2 size-4.5 pointer-events-none transition-colors ${
                          phoneInvalid ? 'text-red-400' : phoneDone ? 'text-emerald-500' : 'text-slate-400 peer-focus:text-sky-500'
                        }`} />
                      </div>
                      {/* Live digit counter */}
                      <div className="flex items-center justify-between mt-0.5">
                        {phoneInvalid ? (
                          <p className="text-[10.5px] text-red-500 font-semibold flex items-center gap-1 animate-in slide-in-from-top-1 duration-150">
                            <ShieldAlert size={10} className="shrink-0" />
                            Only numbers allowed · Must be exactly 10 digits
                          </p>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold">Numbers only · No spaces or +91</span>
                        )}
                        <span className={`text-[10px] font-black font-mono ${
                          formData.phone.length === 10 ? 'text-emerald-500' : formData.phone.length > 0 ? 'text-amber-500' : 'text-slate-300'
                        }`}>
                          {formData.phone.length}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shop Address */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-slate-700 block">Shop Address</label>
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

                  {/* Password + Confirm side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Password with strength checklist */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-slate-700 block">Password</label>
                      <div className="relative group">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={() => markTouched('password')}
                          placeholder="••••••••"
                          className={`pr-10 h-11 rounded-xl bg-white placeholder:text-slate-400 text-slate-900 transition-all duration-200 shadow-2xs peer focus-visible:ring-4 ${
                            showPwHints && !pwAllPassed
                              ? 'border-amber-400 focus-visible:border-amber-500 focus-visible:ring-amber-500/10'
                              : pwAllPassed
                              ? 'border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10'
                              : 'border-slate-200 focus-visible:border-sky-500 focus-visible:ring-sky-500/10'
                          }`}
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>

                      {/* Password strength checklist */}
                      {showPwHints && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Password requirements</p>
                          {[
                            { key: 'length',  label: 'At least 8 characters',         done: pwChecks.length },
                            { key: 'number',  label: 'Contains a number (0-9)',        done: pwChecks.number },
                            { key: 'symbol',  label: 'Contains a symbol (!@#$%^&*...)', done: pwChecks.symbol },
                            { key: 'upper',   label: 'Contains an uppercase letter',   done: pwChecks.upper },
                          ].map(({ key, label, done }) => (
                            <div key={key} className="flex items-center gap-2">
                              <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                                done ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                              }`}>
                                {done && <Check size={9} className="text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-[10.5px] font-semibold transition-colors duration-200 ${
                                done ? 'text-emerald-600' : 'text-slate-400'
                              }`}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-[13px] font-semibold text-slate-700 block">Confirm Password</label>
                      <div className="relative group">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={() => markTouched('confirmPassword')}
                          placeholder="••••••••"
                          className={`pr-10 h-11 rounded-xl bg-white placeholder:text-slate-400 text-slate-900 transition-all duration-200 shadow-2xs peer focus-visible:ring-4 ${
                            confirmMismatch
                              ? 'border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500/10 bg-red-50'
                              : formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword
                              ? 'border-emerald-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/10'
                              : 'border-slate-200 focus-visible:border-sky-500 focus-visible:ring-sky-500/10'
                          }`}
                          required
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {confirmMismatch && (
                        <p className="text-[10.5px] text-red-500 font-semibold flex items-center gap-1 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                          <ShieldAlert size={10} className="shrink-0" />
                          Passwords don&apos;t match
                        </p>
                      )}
                      {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                        <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                          <Check size={10} className="shrink-0" strokeWidth={3} />
                          Passwords match
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(15,23,42,0.12)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.25)] hover:scale-[1.005] active:scale-[0.99] cursor-pointer mt-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2 justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Registering terminal...</span>
                      </div>
                    ) : (
                      <>Create Account <ArrowRight className="size-4" /></>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200/80" />
                  </div>
                  <span className="relative px-3.5 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Or
                  </span>
                </div>

                {/* Sign in link */}
                <Link href="/auth/login" className="block w-full">
                  <button
                    type="button"
                    className="w-full py-3 px-4 border border-slate-200 bg-white hover:bg-slate-50/80 rounded-xl text-sm text-slate-700 font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-xs hover:border-slate-300 cursor-pointer"
                  >
                    <span>
                      Already registered?{' '}
                      <span className="text-sky-600 font-bold hover:underline">Sign In to Terminal</span>
                    </span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4 mt-auto pt-8 border-t border-slate-100/80 z-10 w-full">
          <div className="flex items-center gap-4">
            <span className="font-light text-slate-400">&copy; 2026 Nexurah</span>
            <span className="text-slate-200 font-light">|</span>
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-2 text-[#027a48] font-semibold bg-[#ecfdf3] px-3 py-1.5 rounded-full border border-[#abefc6]/80 shadow-3xs">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Terminal Operational
          </div>
        </div>
      </div>
    </div>
  );
}
