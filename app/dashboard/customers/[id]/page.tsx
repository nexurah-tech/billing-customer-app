'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { CustomerForm } from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/customers');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Customer Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Modify contact details and wholesale credentials</p>
        </div>

        <Link href="/dashboard/customers">
          <Button variant="outline" className="text-xs font-semibold rounded-xl border-slate-200 gap-2 h-9 cursor-pointer">
            <ArrowLeft size={14} />
            Back to Customers
          </Button>
        </Link>
      </div>

      <CustomerForm onSuccess={handleSuccess} customerId={id} />
    </div>
  );
}
