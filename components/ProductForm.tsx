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
import { UploadCloud, X, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    fetchCategories();
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProductDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/products/${productId}`, {
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
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.imageUrl }));
      } else {
        setUploadError(data.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setUploadError('Network error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setUploadError('');
  };

  const createCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
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
      }
    } catch (err) {
      console.error('Error creating category:', err);
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
        alert(productId ? 'Product updated successfully!' : 'Product created successfully!');
        onSuccess();
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Product description"
              className="w-full p-2 border rounded text-sm"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SKU (Stock Keeping Unit) *
            </label>
            <Input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="SKU-001"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <div className="space-y-2">
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {showNewCategory ? (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                  />
                  <Button
                    type="button"
                    onClick={createCategory}
                    className="bg-green-600"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCategory(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewCategory(true)}
                  className="w-full"
                >
                  + Create New Category
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Product Image Asset</h3>
        <div className="space-y-4">
          {formData.imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center justify-center group max-w-xs mx-auto">
              <img
                src={formData.imageUrl}
                alt="Product Preview"
                className="w-full h-40 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-4 right-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1.5 shadow-md cursor-pointer transition-colors"
                title="Remove Image"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200/80 hover:border-indigo-500/50 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-slate-50/50 hover:bg-indigo-50/10 cursor-pointer relative group min-h-[160px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading || loading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="size-11 rounded-full bg-slate-100 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-500 flex items-center justify-center transition-colors">
                <UploadCloud size={20} className={uploading ? 'animate-bounce' : ''} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-800">
                  {uploading ? 'Uploading asset file...' : 'Choose file or drag & drop'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG, or WEBP up to 5MB</p>
              </div>
              {uploadError && (
                <p className="text-[10px] font-semibold text-rose-600 animate-pulse mt-1 flex items-center gap-1">
                  <AlertCircle size={11} />
                  {uploadError}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pricing & Stock</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Stock *
              </label>
              <Input
                type="number"
                step="any"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs (Pieces/Count)</SelectItem>
                  <SelectItem value="kg">kg (Kilograms)</SelectItem>
                  <SelectItem value="litre">litre (Litres)</SelectItem>
                  <SelectItem value="g">g (Grams)</SelectItem>
                  <SelectItem value="ml">ml (Millilitres)</SelectItem>
                  <SelectItem value="box">box</SelectItem>
                  <SelectItem value="pack">pack</SelectItem>
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              
              {!['pcs', 'kg', 'litre', 'g', 'ml', 'box', 'pack'].includes(formData.unit) && (
                <Input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  placeholder="e.g. meter, dozen"
                  className="mt-2"
                  required
                  disabled={loading}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Level
              </label>
              <Input
                type="number"
                step="any"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                placeholder="10.00"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="taxApplicable"
              checked={formData.taxApplicable}
              onChange={(e) =>
                setFormData({ ...formData, taxApplicable: e.target.checked })
              }
              disabled={loading}
              className="rounded"
            />
            <label htmlFor="taxApplicable" className="text-sm text-gray-700">
              Tax Applicable (18% GST)
            </label>
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={loading}
      >
        {loading
          ? productId
            ? 'Updating Product...'
            : 'Creating Product...'
          : productId
          ? 'Update Product'
          : 'Create Product'}
      </Button>

    </form>
  );
}
