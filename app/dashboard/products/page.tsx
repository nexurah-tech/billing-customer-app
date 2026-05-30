'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, AlertCircle, Search, Package, Layers } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: { name: string };
  unitPrice: number;
  stock: number;
  reorderLevel: number;
  imageUrl?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `/api/products${search ? `?search=${search}` : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="text-indigo-500 size-5" />
            Store Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage SKU catalogues, pricing structures, and stock parameters</p>
        </div>

        <Link href="/dashboard/products/new">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 font-bold text-xs gap-2 shadow-sm cursor-pointer">
            <Plus size={16} />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search card */}
      <Card className="p-5 border-slate-200/80 shadow-2xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search products catalogue by name or SKU code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10.5 rounded-xl border-slate-200 text-xs placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white"
          />
        </div>
      </Card>

      {/* Listing state */}
      {loading ? (
        <div className="text-center text-slate-500 font-medium py-12 text-xs uppercase tracking-widest animate-pulse">
          Retrieving products...
        </div>
      ) : products.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-slate-300">
          <Package className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm">No products in catalogue</p>
          <p className="text-xs text-slate-500 mt-1 mb-6">Create SKU records to start checkout operations</p>
          <Link href="/dashboard/products/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-4 cursor-pointer">
              Register First Product
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200/80 shadow-2xs rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    SKU Code
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Product Description
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Category Group
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Price Tier
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Stock count
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Operational Status
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const isLowStock = product.stock < (product.reorderLevel || 10);
                  return (
                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="size-8 rounded-lg object-cover border border-slate-200/60 shadow-3xs shrink-0"
                            />
                          ) : (
                            <div className="size-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package size={13} />
                            </div>
                          )}
                          <span className="font-bold tracking-tight text-slate-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-600 text-[10px] border border-slate-200/20">
                          <Layers size={11} className="text-slate-400" />
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-slate-950">
                        ₹{product.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">
                        <span
                          className={
                            isLowStock
                              ? 'text-rose-600 font-extrabold flex items-center gap-1.5'
                              : 'text-slate-800'
                          }
                        >
                          {isLowStock && <AlertCircle size={13} className="text-rose-500 animate-pulse" />}
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50 text-[10px] font-bold select-none">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[10px] font-bold select-none">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5">
                        <Link href={`/dashboard/products/${product._id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/30 hover:border-indigo-500/20 cursor-pointer"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product._id)}
                          className="size-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/30 hover:border-red-500/20 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

