'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CustomerForm } from '@/components/CustomerForm';
import { Users } from 'lucide-react';

function NewCustomerInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPhone = searchParams.get('phone') || '';
  const initialName = searchParams.get('name') || '';

  const handleSuccess = () => {
    router.push('/dashboard/customers');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-200/60 pb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="text-indigo-500 size-5" />
          Register New Customer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {initialPhone
            ? `Creating profile for number: ${initialPhone}`
            : initialName
            ? `Creating profile for: ${initialName}`
            : 'Fill in the details below to register a new customer profile'}
        </p>
      </div>
      <CustomerForm
        onSuccess={handleSuccess}
        initialName={initialName}
        initialPhone={initialPhone}
      />
    </div>
  );
}

export default function NewCustomerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400 text-sm animate-pulse">Loading...</div>}>
      <NewCustomerInner />
    </Suspense>
  );
}
