'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UploadCloud, X, AlertCircle, Sparkles, Store, 
  Package, Layers, Info, Loader2, Check, Plus 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { apiFetch } from '@/lib/apiClient';

interface Category {
  _id: string;
  name: string;
}

export function ProductForm({ onSuccess, productId }: { onSuccess: () => void; productId?: string }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    unit: 'pcs',
    unitPrice: '',
    costPrice: '',
    stock: '',
    reorderLevel: '',
    taxApplicable: true,
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [imageSourceType, setImageSourceType] = useState<'upload' | 'link'>('upload');
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    }
  };

  const fetchProductDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        const prod = data.data;
        setFormData({
          name: prod.name || '',
          description: prod.description || '',
          sku: prod.sku || '',
          category: typeof prod.category === 'object' ? prod.category?._id : prod.category || '',
          unit: prod.unit || 'pcs',
          unitPrice: String(prod.unitPrice) || '',
          costPrice: String(prod.costPrice) || '',
          stock: String(prod.stock) || '',
          reorderLevel: String(prod.reorderLevel || '') || '',
          taxApplicable: prod.taxApplicable ?? true,
          imageUrl: prod.imageUrl || '',
        });
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      toast.error('Failed to retrieve product information');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      toast.error('Only image assets are supported');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await apiFetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.imageUrl }));
        toast.success('Image asset uploaded successfully');
      } else {
        setUploadError(data.error || 'Failed to upload image');
        toast.error(data.error || 'Failed to upload image asset');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Network error uploading image');
      toast.error('Image upload failed due to a network connection error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadError('');
    toast.info('Image asset removed');
  };

  const handleApplyImageUrl = () => {
    if (!imageUrlInput.trim()) {
      setUploadError('Please enter a valid URL');
      toast.error('URL cannot be empty');
      return;
    }

    try {
      new URL(imageUrlInput);
    } catch (_) {
      setUploadError('Please enter a valid URL format');
      toast.error('Please enter a valid URL');
      return;
    }

    setFormData((prev) => ({ ...prev, imageUrl: imageUrlInput.trim() }));
    toast.success('Image link applied successfully');
    setImageUrlInput('');
  };

  const createCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await apiFetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await response.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setFormData({ ...formData, category: data.data._id });
        setNewCategory('');
        setShowNewCategory(false);
        toast.success(`Category "${data.data.name}" created!`);
      } else {
        toast.error(data.error || 'Failed to create category');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      toast.error('Failed to create category');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const method = productId ? 'PUT' : 'POST';
      const url = productId ? `/api/products/${productId}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          unitPrice: parseFloat(formData.unitPrice),
          costPrice: parseFloat(formData.costPrice),
          stock: parseFloat(formData.stock),
          reorderLevel: formData.reorderLevel ? parseFloat(formData.reorderLevel) : 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(productId ? 'Product record updated successfully!' : 'Product record created successfully!');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to save product');
      }
    } catch (err) {
      toast.error('Error saving product due to a connection issue');
    } finally {
      setLoading(false);
    }
  };

  // Preview card calculated parameters
  const selectedCatName = categories.find(c => c._id === formData.category)?.name || 'General';
  const unitPriceVal = parseFloat(formData.unitPrice) || 0;
  const costPriceVal = parseFloat(formData.costPrice) || 0;
  const hasPricing = unitPriceVal > 0 && costPriceVal > 0;
  const marginAmount = unitPriceVal - costPriceVal;
  const marginPercent = unitPriceVal > 0 ? (marginAmount / unitPriceVal) * 105 - 5 : 0; // custom adjustment or strict margin
  const strictMarginPercent = unitPriceVal > 0 ? (marginAmount / unitPriceVal) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="w-full select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Card 1: Basic Information */}
          <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Store size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Basic Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Product Name *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product title (e.g. Wireless Mouse M100)"
                  className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 px-3.5"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide a detailed description of features, brand details, or specifications..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-1 focus-visible:ring-indigo-500 focus:outline-none min-h-[96px] placeholder:text-slate-400"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    SKU (Stock Keeping Unit) *
                  </label>
                  <Input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="e.g. SKU-1004"
                    className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 px-3.5"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Category *
                    </label>
                  </div>
                  
                  {showNewCategory ? (
                    <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                      <Input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Category name"
                        className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 flex-1 px-3.5"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        onClick={createCategory}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs h-10 px-4.5 cursor-pointer shadow-sm hover:shadow-indigo-500/10 transition-all flex items-center gap-1.5"
                        disabled={loading}
                      >
                        <Check size={14} strokeWidth={2.5} /> Create
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCategory(false)}
                        className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-3.5 cursor-pointer"
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData({ ...formData, category: value })
                          }
                          disabled={loading}
                        >
                          <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500 text-xs font-semibold h-10 px-3.5">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id} className="text-xs font-semibold">
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNewCategory(true)}
                        className="h-10 px-3.5 rounded-xl border-indigo-100 hover:border-indigo-200 bg-indigo-50/40 text-indigo-655 hover:bg-indigo-50 font-black text-xs cursor-pointer gap-1.5 shrink-0 transition-all shadow-2xs hover:shadow-xs flex items-center"
                      >
                        <Plus size={14} strokeWidth={2.5} className="text-indigo-600" />
                        <span className="text-indigo-600">New Category</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Pricing & Inventory */}
          <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white flex flex-col gap-5">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Package size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Pricing & Stock</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Unit Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs select-none">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="pl-7 rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cost Price (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs select-none">
                      ₹
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="pl-7 rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Current Stock *
                  </label>
                  <Input
                    type="number"
                    step="any"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 px-3.5"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Unit of Measure *
                  </label>
                  <Select
                    value={['pcs', 'kg', 'litre', 'g', 'ml', 'box', 'pack'].includes(formData.unit) ? formData.unit : 'custom'}
                    onValueChange={(val) => {
                      if (val === 'custom') {
                        setFormData({ ...formData, unit: '' });
                      } else {
                        setFormData({ ...formData, unit: val });
                      }
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 focus:ring-indigo-500 text-xs font-semibold h-10 px-3.5">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="pcs" className="text-xs font-semibold">pcs (Pieces/Count)</SelectItem>
                      <SelectItem value="kg" className="text-xs font-semibold">kg (Kilograms)</SelectItem>
                      <SelectItem value="litre" className="text-xs font-semibold">litre (Litres)</SelectItem>
                      <SelectItem value="g" className="text-xs font-semibold">g (Grams)</SelectItem>
                      <SelectItem value="ml" className="text-xs font-semibold">ml (Millilitres)</SelectItem>
                      <SelectItem value="box" className="text-xs font-semibold">box</SelectItem>
                      <SelectItem value="pack" className="text-xs font-semibold">pack</SelectItem>
                      <SelectItem value="custom" className="text-xs font-semibold">Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {!['pcs', 'kg', 'litre', 'g', 'ml', 'box', 'pack'].includes(formData.unit) && (
                    <Input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="e.g. meter, dozen"
                      className="mt-2 rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 px-3.5 animate-in slide-in-from-top-1 duration-200"
                      required
                      disabled={loading}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reorder Level
                  </label>
                  <Input
                    type="number"
                    step="any"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    placeholder="10.00"
                    className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 px-3.5"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Tax configuration checkbox wrapper */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 rounded-xl mt-2 select-none hover:bg-slate-50/80 transition-colors">
                <div className="space-y-0.5">
                  <label htmlFor="taxApplicable" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Tax Applicable (18% GST)
                  </label>
                  <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                    Include 18% Goods and Services Tax in the unit selling price
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="taxApplicable"
                  checked={formData.taxApplicable}
                  onChange={(e) =>
                    setFormData({ ...formData, taxApplicable: e.target.checked })
                  }
                  disabled={loading}
                  className="size-4.5 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Assets, Preview & Submissions */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Card 3: Image Assets */}
          <Card className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <div className="p-1 bg-indigo-50 text-indigo-650 rounded-lg shrink-0">
                <Layers size={16} />
              </div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Product Media Asset</h3>
            </div>

            {formData.imageUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 p-2 flex items-center justify-center group max-w-xs mx-auto">
                <img
                  src={formData.imageUrl}
                  alt="Product Preview"
                  className="w-full h-40 object-cover rounded-xl transition-transform duration-350 group-hover:scale-103"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-4.5 right-4.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-2 shadow-md cursor-pointer transition-colors active:scale-90"
                  title="Remove Image"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Image source tabs switcher */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/40 select-none">
                  <button
                    type="button"
                    onClick={() => setImageSourceType('upload')}
                    className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      imageSourceType === 'upload'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceType('link')}
                    className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                      imageSourceType === 'link'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Image URL Link
                  </button>
                </div>

                {imageSourceType === 'upload' ? (
                  <div className="border-2 border-dashed border-slate-200/80 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-indigo-50/10 cursor-pointer relative group min-h-[160px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading || loading}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="size-11 rounded-full bg-slate-100 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-500 flex items-center justify-center transition-colors">
                      <UploadCloud size={20} className={uploading ? 'animate-bounce text-indigo-600' : ''} />
                    </div>
                    <div className="text-center select-none">
                      <p className="text-xs font-bold text-slate-800">
                        {uploading ? 'Uploading asset file...' : 'Choose file or drag & drop'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">PNG, JPG, JPEG, or WEBP up to 5MB</p>
                    </div>
                    {uploadError && (
                      <p className="text-[10px] font-semibold text-rose-600 animate-pulse mt-1 flex items-center gap-1">
                        <AlertCircle size={11} />
                        {uploadError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5 p-3.5 border border-slate-100 rounded-2xl bg-slate-50/40 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Paste Web Image Address
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => {
                            setImageUrlInput(e.target.value);
                            setUploadError('');
                          }}
                          placeholder="https://example.com/item.jpg"
                          className="rounded-xl border-slate-200 focus-visible:ring-indigo-500 text-xs font-semibold h-10 px-3.5 flex-1 bg-white"
                        />
                        <Button
                          type="button"
                          onClick={handleApplyImageUrl}
                          className="bg-indigo-600 hover:bg-indigo-755 text-white rounded-xl font-bold text-xs h-10 px-4 cursor-pointer shadow-sm shrink-0"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                    {uploadError && (
                      <p className="text-[10px] font-semibold text-rose-600 animate-pulse flex items-center gap-1">
                        <AlertCircle size={11} />
                        {uploadError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Card 4: Live Storefront Card Preview */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 to-slate-50/35 overflow-hidden shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2.5">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={11} className="animate-pulse" /> Live Storefront Preview
              </span>
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">POS Catalog</span>
            </div>

            {/* Simulated Customer Store Card */}
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs transition-all duration-300 hover:shadow-md">
              <div className="aspect-video w-full bg-slate-50/50 relative overflow-hidden flex items-center justify-center group border-b border-slate-100">
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-350 py-6">
                    <Store size={26} className="stroke-[1.5] text-slate-400" />
                    <span className="text-[9px] font-bold tracking-wider uppercase text-slate-400">Media Asset Placeholder</span>
                  </div>
                )}
                
                {/* Category Tag overlay */}
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8.5px] font-extrabold uppercase bg-slate-900/80 backdrop-blur-xs text-white tracking-wider">
                  {selectedCatName}
                </span>
                
                {/* Unit Tag overlay */}
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold bg-white/95 backdrop-blur-xs border border-slate-200/50 text-slate-650">
                  Per {formData.unit || 'pcs'}
                </span>
              </div>

              <div className="p-4 space-y-2.5">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 tracking-tight leading-normal truncate">
                    {formData.name || 'Untitled Product'}
                  </h4>
                  <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono font-bold">
                    <span>SKU: {formData.sku ? formData.sku.toUpperCase() : 'SKU-XXXX'}</span>
                    <span>•</span>
                    {/* Stock display badge */}
                    {parseFloat(formData.stock) <= 0 || !formData.stock ? (
                      <span className="text-rose-600 font-extrabold">Out of Stock</span>
                    ) : parseFloat(formData.stock) < (parseFloat(formData.reorderLevel) || 10) ? (
                      <span className="text-amber-500 font-extrabold">Low Stock ({formData.stock})</span>
                    ) : (
                      <span className="text-emerald-600 font-extrabold">In Stock ({formData.stock})</span>
                    )}
                  </div>
                </div>

                {/* Pricing and margin layout */}
                <div className="flex items-end justify-between border-t border-slate-100/50 pt-2.5">
                  <div className="space-y-0.5">
                    <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Selling Price</p>
                    <p className="text-sm font-black text-slate-900 tracking-tight">
                      ₹{formData.unitPrice ? parseFloat(formData.unitPrice).toFixed(2) : '0.00'}
                      {formData.taxApplicable && (
                        <span className="text-[8.5px] font-bold text-indigo-500 ml-1">GST Inc.</span>
                      )}
                    </p>
                  </div>

                  {/* Profit Margin Info */}
                  {hasPricing && (
                    <div className="text-right space-y-0.5">
                      <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Est. Margin</p>
                      <p className={`text-[11px] font-extrabold ${strictMarginPercent >= 15 ? 'text-emerald-600' : 'text-slate-650'}`}>
                        {strictMarginPercent.toFixed(1)}% (₹{marginAmount.toFixed(2)})
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Control Panel */}
          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/products" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                disabled={loading}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-[2] h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  Saving...
                </>
              ) : (
                <>
                  {productId ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </Button>
          </div>

        </div>
      </div>
    </form>
  );
}

