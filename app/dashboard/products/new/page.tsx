'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/ProductForm';

export default function NewProductPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/dashboard/products');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
      <ProductForm onSuccess={handleSuccess} />
    </div>
  );
}
