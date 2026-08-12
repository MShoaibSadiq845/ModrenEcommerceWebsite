'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { getAuthToken } from '@/lib/getAuthToken';

type ProductEditFormInputs = {
  name: string;
  description: string;
  price: string;
  purchaseType: 'regular' | 'loyalty_only' | 'hybrid';
  pointsPrice: string;
  category: string;
  stock: string;
  imageInput: string;
};

export default function AdminEditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: product, isLoading: loadingProduct } = useGetProductByIdQuery(id as string);
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductEditFormInputs>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      purchaseType: 'regular',
      pointsPrice: '',
      category: 'Casual',
      stock: '',
      imageInput: '',
    },
  });

  const watchPurchaseType = watch('purchaseType');
  const watchImageInput = watch('imageInput');

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        purchaseType: product.purchaseType || 'regular',
        pointsPrice: product.pointsPrice ? product.pointsPrice.toString() : '',
        category: product.category || 'Casual',
        stock: product.stock ? product.stock.toString() : '',
        imageInput: product.images?.[0] || '',
      });
    }
  }, [product, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    if (!token) {
      toast.error('You must be logged in to upload images');
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      setValue('imageInput', data.url, { shouldValidate: true });
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ProductEditFormInputs) => {
    setErrorMsg('');
    try {
      await updateProduct({
        id: id as string,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        purchaseType: data.purchaseType,
        pointsPrice: Number(data.pointsPrice),
        category: data.category,
        stock: Number(data.stock),
        images: data.imageInput ? [data.imageInput] : [],
      }).unwrap();

      toast.success('Product updated successfully!');
      router.push('/admin/products');
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to update product';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  if (loadingProduct) return <div className="p-8 text-center">Loading product...</div>;

  return (
    <div className="flex flex-col gap-6 font-['Rubik'] max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 bg-white rounded-xl border hover:bg-gray-50">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">Update details for #{id}</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl font-bold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Name</label>
            <input
              type="text"
              {...register('name', { required: 'Product name is required' })}
              className={`border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-black font-semibold ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.name && (
              <span className="text-[10px] text-red-500 font-semibold px-1">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              rows={3}
              {...register('description', { required: 'Description is required' })}
              className={`border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-black ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.description && (
              <span className="text-[10px] text-red-500 font-semibold px-1">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Base Price ($)</label>
            <input
              type="number"
              {...register('price', { required: 'Base price is required' })}
              className={`border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-black font-bold ${
                errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.price && (
              <span className="text-[10px] text-red-500 font-semibold px-1">
                {errors.price.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Purchase Mode</label>
            <select
              {...register('purchaseType', { required: true })}
              className="border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-black font-bold border-gray-200"
            >
              <option value="regular">Regular Item (Buy with Currency)</option>
              <option value="loyalty_only">Loyalty Only (Buy strictly with Points)</option>
              <option value="hybrid">Hybrid (Buy with Currency or Points)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Loyalty Points Cost</label>
            <input
              type="number"
              {...register('pointsPrice', {
                required: watchPurchaseType !== 'regular' ? 'Points cost is required for this mode' : false,
              })}
              className={`border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-black font-bold ${
                errors.pointsPrice ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.pointsPrice && (
              <span className="text-[10px] text-red-500 font-semibold px-1">
                {errors.pointsPrice.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Stock Quantity</label>
            <input
              type="number"
              {...register('stock', { required: 'Stock quantity is required' })}
              className={`border rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-black font-bold ${
                errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.stock && (
              <span className="text-[10px] text-red-500 font-semibold px-1">
                {errors.stock.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Product Image</label>
            
            <input
              type="hidden"
              {...register('imageInput', { required: 'Product image is required' })}
            />

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-24 h-28 bg-[#f0f0f0] rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 relative">
                {watchImageInput ? (
                  <Image src={watchImageInput} alt="Product Preview" fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>

              <div className="w-full">
                <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all text-center gap-2 ${
                  errors.imageInput ? 'border-red-500 bg-red-50 hover:bg-red-50' : 'border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100'
                }`}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      <span className="text-xs font-bold text-gray-600">Uploading Image...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">Click to upload new image</span>
                      <span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {errors.imageInput && (
              <span className="text-[10px] text-red-500 font-semibold px-1 mt-1">
                {errors.imageInput.message}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {updating ? 'Updating Product...' : 'Save Product Changes'}
        </button>
      </form>
    </div>
  );
}
