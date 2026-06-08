'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus, Edit, Trash2, AlertCircle, Search, Package,
  Tag, IndianRupee, Layers, ShieldAlert, CheckCircle2, Upload,
  ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import BulkUploadModal from '@/components/BulkUploadModal';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  sku: string;
  category: { name: string };
  unitPrice: number;
  stock: number;
  reorderLevel: number;
  imageUrl?: string;
  unit?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, currentPage]);

  const handleSeedProducts = async () => {
    if (seeding) return;
    setSeeding(true);
    const toastId = toast.loading('Seeding default retail catalog...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.data.message || 'Catalog seeded successfully!', { id: toastId });
        fetchProducts();
      } else {
        toast.error(data.error || 'Failed to seed sample catalog', { id: toastId });
      }
    } catch (err) {
      console.error('Seeding products failed:', err);
      toast.error('Network error seeding catalog', { id: toastId });
    } finally {
      setSeeding(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = `/api/products?page=${currentPage}&limit=10${search ? `&search=${search}` : ''}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.pagination.pages || 1);
        setTotalCount(data.data.pagination.total || 0);
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
    <div className="p-6 max-w-7xl mx-auto space-y-5 select-none">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/70">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Package className="text-white size-4.5" />
            </div>
            Store Inventory
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium">
            Manage SKU catalogues, pricing structures, and stock parameters
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleSeedProducts}
            disabled={seeding}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl h-10 px-4 font-bold text-xs gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50 flex items-center"
          >
            <Sparkles size={14} className={seeding ? "animate-spin" : ""} />
            {seeding ? "Seeding..." : "Seed Sample Catalog"}
          </Button>
          <Button 
            onClick={() => setIsBulkModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 font-bold text-xs gap-2 shadow-sm cursor-pointer transition-all flex items-center"
          >
            <Upload size={14} />
            Bulk Import
          </Button>
          <Link href="/dashboard/products/new">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 font-bold text-xs gap-2 shadow-sm cursor-pointer transition-all flex items-center">
              <Plus size={14} />
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Search + Count row ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search by product name or SKU code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 h-10 rounded-xl border-slate-200 text-sm placeholder:text-slate-400 focus-visible:border-indigo-500 bg-white"
          />
        </div>
        {!loading && (
          <span className="shrink-0 text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200/60 px-3.5 py-2 rounded-xl">
            {totalCount} product{totalCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {/* ── States ── */}
      {loading ? (
        <div className="text-center text-slate-400 font-semibold py-16 text-xs uppercase tracking-widest animate-pulse">
          Loading inventory...
        </div>
      ) : products.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-slate-300 rounded-2xl bg-white shadow-xs">
          <Package className="size-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-sm">No products in catalogue</p>
          <p className="text-xs text-slate-400 mt-1 mb-6">Register a product, upload a spreadsheet, or populate sample inventory to start</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              onClick={handleSeedProducts}
              disabled={seeding}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-xl text-xs px-5 h-9 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles size={13} className={seeding ? "animate-spin" : ""} />
              {seeding ? "Seeding..." : "Seed Sample Catalog"}
            </Button>
            <Button 
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl text-xs px-5 h-9 cursor-pointer flex items-center gap-1.5"
            >
              <Upload size={13} />
              Bulk Import Spreadsheet
            </Button>
            <Link href="/dashboard/products/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-xs px-5 h-9 cursor-pointer flex items-center gap-1.5">
                <Plus size={13} />
                Register First Product
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200/80 shadow-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">

              {/* ── Table Head ── */}
              <thead>
                <tr className="bg-slate-900">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    SKU Code
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Product
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Unit Price
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Stock
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ── Table Body ── */}
              <tbody className="divide-y divide-slate-100">
                {products.map((product, idx) => {
                  const isLowStock = product.stock < (product.reorderLevel || 10);
                  return (
                    <tr
                      key={product._id}
                      className="group hover:bg-indigo-50/40 transition-colors duration-150"
                    >
                      {/* SKU */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                          <Tag size={10} className="text-indigo-400" />
                          {product.sku}
                        </span>
                      </td>

                      {/* Product name + image */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="size-9 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="size-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <Package size={14} className="text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-tight">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/60 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                          <Layers size={10} className="text-slate-400" />
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5">
                        <span className="text-[14px] font-black text-slate-900 flex items-center gap-0.5">
                          <IndianRupee size={12} className="text-slate-600" strokeWidth={2.5} />
                          {product.unitPrice.toFixed(2)}
                        </span>
                      </td>

                      {/* Stock count */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {isLowStock && (
                            <AlertCircle size={13} className="text-rose-500 animate-pulse shrink-0" />
                          )}
                          <span className={`text-[13px] font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-800'}`}>
                            {product.stock}
                            <span className="text-[10px] font-semibold text-slate-400 ml-1">{product.unit || 'pcs'}</span>
                          </span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3.5">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/60 text-[11px] font-bold">
                            <ShieldAlert size={11} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                            <CheckCircle2 size={11} />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/dashboard/products/${product._id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200/50 hover:border-indigo-200 cursor-pointer transition-all"
                            >
                              <Edit size={14} />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product._id)}
                            className="size-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200/50 hover:border-red-200 cursor-pointer transition-all"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
            <div className="flex gap-4">
              <p className="text-[11px] text-slate-400 font-semibold">
                {totalCount} total products
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">
                {products.filter(p => p.stock < (p.reorderLevel || 10)).length} low stock on this page
              </p>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="size-7 rounded-lg text-slate-500 border-slate-200 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                </Button>
                
                <span className="text-[10px] font-bold text-slate-500 px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200/50">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="size-7 rounded-lg text-slate-500 border-slate-200 cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight size={13} />
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bulk Import Modal */}
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
