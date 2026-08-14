'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useCreateProductMutation } from '@/store/services/productsApi';
import { ArrowLeft, Save, UploadCloud, Image as ImageIcon, Loader2, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { getAuthToken } from '@/lib/getAuthToken';

const ALL_SIZES = ['XX-Small','X-Small','Small','Medium','Large','X-Large','XX-Large','3X-Large','4X-Large'];
const CATEGORIES = ['Casual','Formal','Party','Gym','T-shirts','Shirts','Jeans','Shorts','Hoodie'];

/* ── Preset colour swatches the admin can pick from ── */
const PRESET_COLORS = [
  { name: 'Green',   hex: '#22c55e' },
  { name: 'Red',     hex: '#ef4444' },
  { name: 'Yellow',  hex: '#eab308' },
  { name: 'Orange',  hex: '#f97316' },
  { name: 'Blue',    hex: '#3b82f6' },
  { name: 'Purple',  hex: '#a855f7' },
  { name: 'Pink',    hex: '#ec4899' },
  { name: 'Black',   hex: '#111111' },
  { name: 'White',   hex: '#ffffff' },
  { name: 'Gray',    hex: '#9ca3af' },
];

type ColorEntry = {
  name: string;
  hex: string;
  imageUrl: string;   // Cloudinary URL after upload
  uploading: boolean;
};

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
  imageInput: string; // main / fallback image
};

export default function AdminAddProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /* sizes */
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['Medium','Large','X-Large']);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  /* colors — only ONE active index at a time */
  const [colors, setColors] = useState<ColorEntry[]>([]);
  const [activeColorIdx, setActiveColorIdx] = useState<number | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorFileRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  /* ── Sizes ── */
  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  /* ── Generic Cloudinary upload helper ── */
  const uploadFile = async (file: File): Promise<string> => {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/upload`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
    );
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    const data = await res.json();
    return data.url as string;
  };

  /* ── Main product image upload ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setValue('imageInput', url, { shouldValidate: true });
      toast.success('Image uploaded!');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Add a colour swatch ── */
  const addColor = (preset: { name: string; hex: string }) => {
    if (colors.some(c => c.hex === preset.hex)) {
      toast('Color already added', { icon: 'ℹ️' });
      return;
    }
    const newIdx = colors.length;
    setColors(prev => [...prev, { name: preset.name, hex: preset.hex, imageUrl: '', uploading: false }]);
    setActiveColorIdx(newIdx);
    // keep picker open so multiple colors can be selected in one go
  };

  /* ── Remove a colour ── */
  const removeColor = (idx: number) => {
    setColors(prev => prev.filter((_, i) => i !== idx));
    setActiveColorIdx(prev => {
      if (prev === null) return null;
      if (prev === idx) return null;
      if (prev > idx) return prev - 1;
      return prev;
    });
  };

  /* ── Per-colour image upload ── */
  const handleColorImageChange = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setColors(prev => prev.map((c, i) => i === idx ? { ...c, uploading: true } : c));
    try {
      const url = await uploadFile(file);
      setColors(prev => prev.map((c, i) => i === idx ? { ...c, imageUrl: url, uploading: false } : c));
      toast.success(`Image set for ${colors[idx].name}`);
    } catch (err: any) {
      setColors(prev => prev.map((c, i) => i === idx ? { ...c, uploading: false } : c));
      toast.error(err?.message || 'Upload failed');
    }
    // reset input so the same file can be re-selected if needed
    if (colorFileRefs.current[idx]) colorFileRefs.current[idx]!.value = '';
  };

  /* ── Submit ── */
  const onSubmit = async (data: FormInputs) => {
    if (selectedSizes.length === 0) { toast.error('Select at least one size'); return; }
    setErrorMsg('');
    try {
      const priceNum = Number(data.price);
      const ratingNum = Math.min(5, Math.max(1, Number(data.rating) || 4.5));
      const pointsPrice = Math.round(priceNum * 10);

      // Build images array: per-colour images first, then the main fallback
      const colorImages = colors.filter(c => c.imageUrl).map(c => c.imageUrl);
      const images = colorImages.length > 0
        ? colorImages
        : [data.imageInput || '/images/7.png'];

      // Build colors payload
      const colorsPayload = colors.map(c => ({
        name: c.name,
        hex: c.hex,
        imageUrl: c.imageUrl || data.imageInput || '',
      }));

      await createProduct({
        name: data.name,
        description: data.description,
        price: priceNum,
        salePrice: priceNum,
        isOnSale: false,
        purchaseType: data.purchaseType,
        pointsPrice,
        category: data.category,
        brand: data.brand,
        size: selectedSizes[0] || 'Medium',
        sizes: selectedSizes,
        stock: Number(data.stock),
        sku: data.sku,
        images,
        colors: colorsPayload,
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

  /* ── Star preview ── */
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
      {/* Page header */}
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

        {/* ── Sizes ── */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            Available Sizes
            {selectedSizes.length > 0 && (
              <span className="ml-2 text-[10px] font-normal text-gray-400 normal-case">
                {selectedSizes.length} selected
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            className="flex items-center justify-between w-full border border-gray-200 bg-gray-50 hover:bg-white rounded-xl p-3 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-black transition-all"
          >
            <span>
              {selectedSizes.length === 0 ? 'Select sizes...' : selectedSizes.join(', ')}
            </span>
            {showSizeDropdown
              ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
              : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
          </button>

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
                <button type="button" onClick={() => setShowSizeDropdown(false)}
                  className="text-[11px] font-bold text-black underline">
                  Done
                </button>
              </div>
            </div>
          )}
          {selectedSizes.length === 0 && (
            <p className="text-[10px] text-amber-600 font-semibold">⚠ Select at least one size</p>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            COLORS + PER-COLOR IMAGE UPLOAD
        ══════════════════════════════════════════════ */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Colors
              {colors.length > 0 && (
                <span className="ml-2 text-[10px] font-normal text-gray-400 normal-case">
                  {colors.length} added
                </span>
              )}
            </label>
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-black border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Color
              {showColorPicker
                ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </button>
          </div>

          {/* ── Color swatch picker ── */}
          {showColorPicker && (
            <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Pick colors — click to add, click again row to select
                </p>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(false)}
                  className="text-[11px] font-bold text-black underline"
                >
                  Done
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map(preset => {
                  const alreadyAdded = colors.some(c => c.hex === preset.hex);
                  return (
                    <button
                      key={preset.hex}
                      type="button"
                      title={preset.name}
                      onClick={() => addColor(preset)}
                      className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                        alreadyAdded
                          ? 'border-black scale-110 cursor-default'
                          : 'border-transparent hover:scale-110 hover:border-gray-400 cursor-pointer'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                    >
                      {/* tick overlay for already-added swatches */}
                      {alreadyAdded && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-4 h-4 drop-shadow" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8l3.5 3.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {colors.length > 0 && (
                <p className="mt-3 text-[10px] text-gray-400">
                  {colors.length} color{colors.length > 1 ? 's' : ''} added — upload an image for each below.
                </p>
              )}
            </div>
          )}

          {/* ── Added colours list with per-colour upload ── */}
          {colors.length > 0 && (
            <div className="flex flex-col gap-3">
              {colors.map((color, idx) => {
                const isActive = activeColorIdx === idx;
                return (
                  <div
                    key={color.hex}
                    onClick={() => setActiveColorIdx(idx)}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${
                      isActive
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Color swatch + name */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* The swatch: black ring only when THIS color is active */}
                      <div
                        className={`w-8 h-8 rounded-full border-2 shrink-0 ${
                          isActive ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm font-semibold text-gray-800 w-16">{color.name}</span>
                    </div>

                    {/* Image upload zone */}
                    <div className="flex-1 flex items-center gap-3" onClick={e => e.stopPropagation()}>
                      {/* Preview thumbnail */}
                      <div className="w-12 h-12 rounded-lg border border-gray-200 bg-[#f0f0f0] overflow-hidden relative shrink-0 flex items-center justify-center">
                        {color.imageUrl ? (
                          <Image src={color.imageUrl} alt={color.name} fill className="object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        )}
                      </div>

                      {/* Upload button */}
                      <label className={`flex-1 flex items-center justify-center gap-2 border border-dashed rounded-lg p-2.5 cursor-pointer transition-all text-xs font-medium ${
                        color.uploading
                          ? 'border-gray-200 bg-gray-50 text-gray-400'
                          : color.imageUrl
                            ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                            : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-black hover:bg-gray-100'
                      }`}>
                        {color.uploading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading…
                          </>
                        ) : color.imageUrl ? (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Change image
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Upload image for {color.name}
                          </>
                        )}
                        <input
                          ref={el => { colorFileRefs.current[idx] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={color.uploading}
                          onChange={e => handleColorImageChange(e, idx)}
                        />
                      </label>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); removeColor(idx); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                      title="Remove color"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {colors.length === 0 && (
            <p className="text-[10px] text-gray-400">No colors added — product will show without color options.</p>
          )}
        </div>

        {/* ── Main / Fallback Product Image ── */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            {colors.length > 0 ? 'Fallback Product Image' : 'Product Image'}
          </label>
          {colors.length > 0 && (
            <p className="text-[10px] text-gray-400">Used when no colour is selected. If all colours have images, this is still recommended.</p>
          )}
          <input type="hidden" {...register('imageInput', { required: colors.length === 0 ? 'Image is required' : false })} />

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-20 h-24 sm:w-24 sm:h-28 bg-[#f0f0f0] rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shrink-0 relative">
              {watchImageInput ? (
                <Image src={watchImageInput} alt="Preview" fill className="object-cover" />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-300" />
              )}
            </div>

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

        {/* Loyalty Points info */}
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
