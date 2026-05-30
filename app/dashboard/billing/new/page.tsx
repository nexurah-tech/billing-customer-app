'use client';

import { useRouter } from 'next/navigation';
import { BillingForm } from '@/components/BillingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/billing');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with back navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6 select-none">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Checkout POS Terminal</h1>
          <p className="text-xs text-slate-500 mt-1">Create, calculate, and publish retail invoice receipts</p>
        </div>

        <Link href="/dashboard/billing">
          <Button variant="outline" className="text-xs font-semibold rounded-xl border-slate-200 gap-2 h-9 cursor-pointer">
            <ArrowLeft size={14} />
            Back to Invoices
          </Button>
        </Link>
      </div>

      <BillingForm onSuccess={handleSuccess} />
    </div>
  );
}

