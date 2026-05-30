'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { ProductForm } from '@/components/ProductForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/products');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product Record</h1>
          <p className="text-xs text-slate-500 mt-1">Modify inventory specifications and price tiers</p>
        </div>

        <Link href="/dashboard/products">
          <Button variant="outline" className="text-xs font-semibold rounded-xl border-slate-200 gap-2 h-9 cursor-pointer">
            <ArrowLeft size={14} />
            Back to Products
          </Button>
        </Link>
      </div>

      <ProductForm onSuccess={handleSuccess} productId={id} />
    </div>
  );
}
