'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateProductMutation } from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { getAuthToken } from '@/lib/getAuthToken';

const ALL_SIZES = ['XX-Small','X-Small','Small','Medium','Large','X-Large','XX-Large','3X-Large','4X-Large'];

const CATEGORIES = ['Casual','Formal','Party','Gym','T-shirts','Shirts','Jeans','Shorts','Hoodie'];

type FormInputs = {
  name: string;
  description: string;
  price: string;
  purchaseType: 'regular' | 'loyalty_only' | 'hybrid';
  category: string;
  brand: string;
  stock: string;
  sku: string;
  rating: string;
  imageInput: string;
};

export default function AdminAddProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['Medium','Large','X-Large']);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormInputs>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      purchaseType: 'regular',
      category: 'Casual',
      brand: 'SHOP.CO',
      stock: '50',
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      rating: '4.5',
      imageInput: '',
    },
  });

  const watchImageInput = watch('imageInput');
  const watchRating = watch('rating');
  const watchPurchaseType = watch('purchaseType');

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = getAuthToken();
    if (!token) { toast.error('Not authenticated'); return; }
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/upload`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
      );
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json();
      setValue('imageInput', data.url, { shouldValidate: true });
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormInputs) => {
    if (selectedSizes.length === 0) { toast.error('Select at least one size'); return; }
    setErrorMsg('');
    try {
      const priceNum = Number(data.price);
      const ratingNum = Math.min(5, Math.max(1, Number(data.rating) || 4.5));
      // Auto-calculate points price from base price (10× price)
      const pointsPrice = Math.round(priceNum * 10);

      await createProduct({
        name: data.name,
        description: data.description,
        price: priceNum,
        salePrice: priceNum,
        isOnSale: false,
        purchaseType: data.purchaseType,
        pointsPrice,           // auto-calculated, not user-entered
        category: data.category,
        brand: data.brand,
        size: selectedSizes[0] || 'Medium',
        sizes: selectedSizes,  // all selected sizes stored
        stock: Number(data.stock),
        sku: data.sku,
        images: [data.imageInput || '/images/7.png'],
        tags: [data.category.toLowerCase(), data.brand.toLowerCase(), ...selectedSizes.map(s => s.toLowerCase())],
        rating: ratingNum,
      } as any).unwrap();

      toast.success('Product created!');
      router.push('/admin/products');
    } catch (err: any) {
      const msg = err?.data?.message || 'Failed to create product';
      setErrorMsg(msg);
      toast.error(msg);
    }
  };

  // Live star preview
  const ratingVal = Math.min(5, Math.max(0, Number(watchRating) || 0));
  const fullStars = Math.floor(ratingVal);
  const hasHalf = ratingVal % 1 >= 0.3;

  const StarIcon = ({ filled, half }: { filled: boolean; half?: boolean }) => (
    <svg className={`w-4 h-4 ${filled || half ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-5 font-['Rubik'] w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-all">
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-[11px] text-gray-400 font-['Open_Sans']">Fill in details — loyalty points cost is calculated automatically</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-bold">{errorMsg}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-100 shadow-sm flex flex-col gap-5">

        {/* Product Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Product Name</label>
          <input
            type="text" placeholder="e.g. Classic Oversized Hoodie"
            {...register('name', { required: 'Required' })}
            className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-medium transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
          />
          {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Description</label>
          <textarea
            rows={3} placeholder="Detailed garment specifications..."
            {...register('description', { required: 'Required' })}
            className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black resize-none transition-all ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
          />
          {errors.description && <span className="text-[10px] text-red-500">{errors.description.message}</span>}
        </div>

        {/* Price + Purchase Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Base Price ($)</label>
            <input
              type="number" min="0" step="0.01" placeholder="120"
              {...register('price', { required: 'Required', min: { value: 0, message: 'Min 0' } })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-bold transition-all ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
            {errors.price && <span className="text-[10px] text-red-500">{errors.price.message}</span>}
            {/* Show auto-calculated points cost */}
            {watch('price') && Number(watch('price')) > 0 && (
              <p className="text-[10px] text-amber-600 font-semibold">
                🏆 Auto loyalty cost: {Math.round(Number(watch('price')) * 10)} pts
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Purchase Mode</label>
            <select
              {...register('purchaseType')}
              className="border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-medium transition-all"
            >
              <option value="regular">Regular (Currency only)</option>
              <option value="loyalty_only">Loyalty Only (Points only)</option>
              <option value="hybrid">Hybrid (Currency or Points)</option>
            </select>
            <p className="text-[10px] text-gray-400">
              {watchPurchaseType === 'regular' && 'Customers pay with money only'}
              {watchPurchaseType === 'loyalty_only' && 'Customers pay with loyalty points only'}
              {watchPurchaseType === 'hybrid' && 'Customers can use money or points'}
            </p>
          </div>
        </div>

        {/* Category + Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Category</label>
            <select
              {...register('category', { required: 'Required' })}
              className="border border-gray-200 bg-gray-50 focus:bg-white rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-medium transition-all"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Brand</label>
            <input
              type="text" placeholder="SHOP.CO"
              {...register('brand', { required: 'Required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-medium transition-all ${errors.brand ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
          </div>
        </div>

        {/* Stock + SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Stock Quantity</label>
            <input
              type="number" min="0"
              {...register('stock', { required: 'Required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-bold transition-all ${errors.stock ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
            {errors.stock && <span className="text-[10px] text-red-500">{errors.stock.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">SKU Code</label>
            <input
              type="text"
              {...register('sku', { required: 'Required' })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-mono font-bold transition-all ${errors.sku ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Product Rating (1.0 – 5.0)
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="number" min="1" max="5" step="0.1" placeholder="4.5"
              {...register('rating', {
                required: 'Required',
                min: { value: 1, message: 'Min 1' },
                max: { value: 5, message: 'Max 5' },
              })}
              className={`border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-black font-bold w-full sm:w-32 transition-all ${errors.rating ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
            />
            {/* Live preview */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} filled={i < fullStars} half={i === fullStars && hasHalf} />
              ))}
              <span className="text-xs text-gray-500 font-bold ml-1.5">{ratingVal.toFixed(1)}/5</span>
            </div>
          </div>
          {errors.rating && <span className="text-[10px] text-red-500">{errors.rating.message}</span>}
          <p className="text-[10px] text-gray-400">This rating displays below the product card in the shop — shown dynamically.</p>
        </div>

        {/* Sizes — dropdown with pill toggles */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Available Sizes
            {selectedSizes.length > 0 && (
              <span className="ml-2 text-[10px] font-normal text-gray-400 normal-case">
                {selectedSizes.length} selected
              </span>
            )}
          </label>

          {/* Dropdown trigger */}
          <button
            type="button"
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            className="flex items-center justify-between w-full border border-gray-200 bg-gray-50 hover:bg-white rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-black transition-all"
          >
            <span>
              {selectedSizes.length === 0
                ? 'Select sizes...'
                : selectedSizes.join(', ')}
            </span>
            {showSizeDropdown ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
          </button>

          {/* Size pills in dropdown */}
          {showSizeDropdown && (
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-md">
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map(size => (
                  <button
                    key={size} type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-3 py-1.5 text-xs rounded-full border font-medium transition-all ${
                      selectedSizes.includes(size)
                        ? 'bg-black text-white border-black'
                        : 'bg-[#f0f0f0] text-gray-700 border-transparent hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-gray-400">
                  {selectedSizes.length === 0 ? 'No sizes selected' : `Selected: ${selectedSizes.join(', ')}`}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSizeDropdown(false)}
                  className="text-[11px] font-bold text-black underline"
                >
                  Done
                </button>
              </div>
            </div>
          )}
          {selectedSizes.length === 0 && (
            <p className="text-[10px] text-amber-600 font-semibold">⚠ Select at least one size</p>
          )}
        </div>

        {/* Product Image */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">Product Image</label>
          <input type="hidden" {...register('imageInput', { required: 'Image is required' })} />

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Preview */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#f0f0f0] rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 relative">
              {watchImageInput ? (
                <Image src={watchImageInput} alt="Preview" fill className="object-cover" />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-300" />
              )}
            </div>

            {/* Upload zone */}
            <label className={`flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all gap-2 text-center ${
              errors.imageInput ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100'
            }`}>
              {isUploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  <span className="text-xs font-bold text-gray-600">Uploading to Cloudinary...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6 text-gray-400" />
                  <span className="text-xs font-bold text-gray-700">Click to upload product image</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} className="hidden" />
            </label>
          </div>
          {errors.imageInput && <span className="text-[10px] text-red-500">{errors.imageInput.message}</span>}
        </div>

        {/* Info box: loyalty points policy */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
          <p className="font-bold mb-1">🏆 Loyalty Points System</p>
          <ul className="flex flex-col gap-1 font-medium text-amber-700 list-none">
            <li>• Customers earn <strong>1 point per $10</strong> spent on currency purchases</li>
            <li>• After collecting <strong>1,000 points</strong>, they can redeem one free item</li>
            <li>• Points cost for this product is auto-set to <strong>price × 10</strong></li>
            <li>• Set Purchase Mode to <strong>"Loyalty Only"</strong> or <strong>"Hybrid"</strong> to enable points redemption</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading || selectedSizes.length === 0}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Creating Product...' : 'Create & Publish Product'}
        </button>
      </form>
    </div>
  );
}
