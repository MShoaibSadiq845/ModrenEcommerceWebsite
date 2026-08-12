'use client';

import React, { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGetProductsQuery } from '@/store/services/productsApi';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';
import { SlidersHorizontal, ChevronRight, ChevronLeft, Award } from 'lucide-react';

type ProductItem = {
  _id: string;
  name: string;
  images?: string[];
  isOnSale?: boolean;
  salePrice?: number;
  price: number;
  rating?: number;
  purchaseType?: string;
};

type ProductQueryParams = {
  page: number;
  limit: number;
  sort: string;
  category?: string;
  isOnSale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
};

/* ─── Shared Stars ─── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Product card for catalog ─── */
function CatalogCard({ product }: { product: ProductItem }) {
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const discount = product.isOnSale && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link href={`/shop/${product._id}`} className="flex flex-col gap-3 group">
      <div className="relative w-full aspect-square sm:aspect-[3/4] bg-[#f2f0f1] rounded-[20px] overflow-hidden">
        <Image
          src={img}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.isOnSale && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {product.purchaseType === 'loyalty_only' && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" /> Points
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-sm sm:text-base text-black line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <Stars rating={product.rating || 4.5} />
          <span className="text-xs text-gray-500">{product.rating || 4.5}/5</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-lg text-black">${price}</span>
          {product.isOnSale && (
            <>
              <span className="text-sm text-gray-400 line-through">${product.price}</span>
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{discount}%</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Filter sidebar item separator ─── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-gray-200 pt-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-4"
      >
        <span className="font-bold text-sm text-black">{title}</span>
        <svg className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

/* ─── Main content (inside Suspense) ─── */
function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sortLabelFromQuery = (value: string | null) => {
    switch (value) {
      case 'newest':
        return 'Newest';
      case 'price-asc':
        return 'Price: Low to High';
      case 'price-desc':
        return 'Price: High to Low';
      case 'most-popular':
      case 'rating':
        return 'Most Popular';
      default:
        return 'Most Popular';
    }
  };

  const sortQueryFromLabel = (label: string) => {
    switch (label) {
      case 'Newest':
        return 'newest';
      case 'Price: Low to High':
        return 'price-asc';
      case 'Price: High to Low':
        return 'price-desc';
      default:
        return 'most-popular';
    }
  };

  const category = searchParams.get('category') || '';
  const isOnSale = searchParams.get('isOnSale') === 'true';
  const minPrice = Number(searchParams.get('minPrice') || '50');
  const maxPrice = Number(searchParams.get('maxPrice') || '200');
  const sort = sortLabelFromQuery(searchParams.get('sort'));
  const page = Number(searchParams.get('page') || '1');
  const selectedColors = useMemo(
    () => (searchParams.get('color') ? searchParams.get('color')!.split(',').map((v) => v.trim()).filter(Boolean) : []),
    [searchParams],
  );
  const selectedSizes = useMemo(
    () => (searchParams.get('size') ? searchParams.get('size')!.split(',').map((v) => v.trim()).filter(Boolean) : []),
    [searchParams],
  );
  const [selectedDressStyle, setSelectedDressStyle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateQueryParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const queryString = params.toString();
    router.replace(queryString ? `/shop?${queryString}` : '/shop');
  };

  const queryParams: ProductQueryParams = {
    page,
    limit: 9,
    sort: sortQueryFromLabel(sort),
  };
  if (category) queryParams.category = category;
  if (isOnSale) queryParams.isOnSale = true;
  if (minPrice > 0) queryParams.minPrice = minPrice;
  if (maxPrice < 1000) queryParams.maxPrice = maxPrice;
  if (selectedColors.length) queryParams.color = selectedColors.join(',');
  if (selectedSizes.length) queryParams.size = selectedSizes.join(',');

  const { data, isLoading } = useGetProductsQuery(queryParams);
  const products = data?.products || [];
  const totalPages = data?.pages || 1;
  const totalProducts = data?.total || 0;

  const categories = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
  const colors = ['#00c12b', '#f50000', '#f5dd00', '#ff7900', '#00c', '#862fdb', '#ff4789', '#000', '#f5f5f5'];
  const sizes = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'];
  const dressStyles = ['Casual', 'Formal', 'Party', 'Gym'];

  const toggleColor = (c: string) => {
    const nextColors = selectedColors.includes(c)
      ? selectedColors.filter((x) => x !== c)
      : [...selectedColors, c];
    updateQueryParams({ color: nextColors.length ? nextColors.join(',') : undefined, page: '1' });
  };

  const toggleSize = (s: string) => {
    const nextSizes = selectedSizes.includes(s)
      ? selectedSizes.filter((x) => x !== s)
      : [...selectedSizes, s];
    updateQueryParams({ size: nextSizes.length ? nextSizes.join(',') : undefined, page: '1' });
  };

  const handleApplyFilters = () => {
    setSidebarOpen(false);
  };

  const breadcrumbLabel = category || (isOnSale ? 'Sale' : 'Casual');

  /* Pagination page numbers */
  const pageNumbers = () => {
    const nums: (number | '...')[] = [];
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) nums.push(i);
      else if (nums[nums.length - 1] !== '...') nums.push('...');
    }
    return nums;
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 font-['Satoshi']">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium capitalize">{breadcrumbLabel}</span>
      </nav>

      <div className="flex gap-6 items-start">
        {/* ─── Filter Sidebar ─── */}
        <aside className={`
          shrink-0 w-72 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-5
          fixed lg:static inset-y-0 left-0 z-40 overflow-y-auto transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-black flex items-center gap-2">
              Filters
            </h3>
            <Image src="/images/33.png" width={20} height={20} alt="filter" className="opacity-50" />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateQueryParams({ category: category === cat ? undefined : cat, page: '1' })}
                className={`flex items-center justify-between py-1.5 text-sm transition-colors ${
                  category === cat ? 'text-black font-bold' : 'text-gray-600 hover:text-black'
                }`}
              >
                <span>{cat}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>

          {/* Price */}
          <FilterSection title="Price">
            <div className="flex flex-col gap-3">
              <div className="text-sm text-gray-600 font-medium">
                ${minPrice} — ${maxPrice}
              </div>
              <input
                type="range"
                min={0}
                max={500}
                value={maxPrice}
                onChange={(e) => updateQueryParams({ maxPrice: String(Number(e.target.value)), page: '1' })}
                className="w-full"
              />
            </div>
          </FilterSection>

          {/* Colors */}
          <FilterSection title="Colors">
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColors.includes(c) ? 'border-black scale-110' : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </FilterSection>

          {/* Size */}
          <FilterSection title="Size">
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    selectedSizes.includes(s)
                      ? 'bg-black text-white border-black'
                      : 'bg-[#f0f0f0] text-gray-700 border-transparent hover:border-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Dress Style */}
          <FilterSection title="Dress Style">
            <div className="flex flex-col gap-2">
              {dressStyles.map((ds) => (
                <button
                  key={ds}
                  onClick={() => setSelectedDressStyle(selectedDressStyle === ds ? '' : ds)}
                  className={`flex items-center justify-between py-1.5 text-sm transition-colors ${
                    selectedDressStyle === ds ? 'text-black font-bold' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <span>{ds}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </FilterSection>

          <button
            onClick={handleApplyFilters}
            className="w-full bg-black text-white rounded-full py-3 text-sm font-semibold hover:bg-gray-800 transition-colors mt-2"
          >
            Apply Filter
          </button>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ─── Main Catalog ─── */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-black capitalize">
                {breadcrumbLabel}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing 1-{Math.min(products.length, 10)} of {totalProducts} Products
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => updateQueryParams({ sort: sortQueryFromLabel(e.target.value), page: '1' })}
                  className="bg-transparent text-sm font-medium outline-none border-b border-gray-300 pb-0.5 cursor-pointer"
                >
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product grid */}
          {isLoading ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center gap-3 bg-gray-50 rounded-2xl text-center">
              <p className="font-bold text-gray-700">No products found</p>
              <p className="text-xs text-gray-400">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p: ProductItem) => <CatalogCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
              <button
                disabled={page <= 1}
                onClick={() => updateQueryParams({ page: String(page - 1) })}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers().map((num, i) =>
                  num === '...' ? (
                    <span key={i} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => updateQueryParams({ page: String(num) })}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === num ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => updateQueryParams({ page: String(page + 1) })}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopCatalogPage() {
  return (
    <Suspense fallback={<div className="w-full p-12"><ProductGridSkeleton count={9} /></div>}>
      <ShopCatalogContent />
    </Suspense>
  );
}
