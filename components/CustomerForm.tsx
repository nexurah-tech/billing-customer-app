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

export function CustomerForm({
  onSuccess,
  customerId,
  initialName,
  initialPhone,
}: {
  onSuccess: () => void;
  customerId?: string;
  initialName?: string;
  initialPhone?: string;
}) {
  const [formData, setFormData] = useState({
    name: initialName || '',
    email: '',
    phone: initialPhone || '',
    address: '',
    customerType: 'retail',
    gstNumber: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.data) {
        const cust = data.data;
        setFormData({
          name: cust.name || '',
          email: cust.email || '',
          phone: cust.phone || '',
          address: cust.address || '',
          customerType: cust.customerType || 'retail',
          gstNumber: cust.gstNumber || '',
        });
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
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
      const method = customerId ? 'PUT' : 'POST';
      const url = customerId ? `/api/customers/${customerId}` : '/api/customers';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(customerId ? 'Customer updated successfully!' : 'Customer created successfully!');
        onSuccess();
      } else {
        alert(data.error || 'Failed to save customer');
      }
    } catch (err) {
      alert('Error saving customer');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street, City, State 12345"
              className="w-full p-2 border rounded text-sm"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type
            </label>
            <Select
              value={formData.customerType}
              onValueChange={(value) =>
                setFormData({ ...formData, customerType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="wholesale">Wholesale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.customerType === 'wholesale' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <Input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="27AABCU9603R1Z0"
                disabled={loading}
              />
            </div>
          )}
        </div>
      </Card>

      <Button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        disabled={loading}
      >
        {loading
          ? customerId
            ? 'Updating Customer...'
            : 'Creating Customer...'
          : customerId
          ? 'Update Customer'
          : 'Create Customer'}
      </Button>

    </form>
  );
}
