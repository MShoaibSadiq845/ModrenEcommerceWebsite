'use client';

import React, { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useGetProductsQuery } from '@/store/services/productsApi';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import { SlidersHorizontal, ChevronRight, ChevronLeft, Award, Search, X } from 'lucide-react';

/* ─── Types ─── */
type ProductItem = {
  _id: string; name: string; images?: string[];
  isOnSale?: boolean; salePrice?: number; price: number;
  rating?: number; purchaseType?: string;
};
type ProductQueryParams = {
  page: number; limit: number; sort: string;
  category?: string; isOnSale?: boolean;
  minPrice?: number; maxPrice?: number;
  color?: string; size?: string; search?: string;
};

/* ─── Stars ─── */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} fill="currentColor" viewBox="0 0 20 20"
          className={`w-3.5 h-3.5 ${i < full ? 'text-amber-400' : i === full && hasHalf ? 'text-amber-300' : 'text-gray-200'}`}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Product Card ─── */
function CatalogCard({ product }: { product: ProductItem }) {
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const discount = product.isOnSale && product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  return (
    <Link href={`/shop/${product._id}`} className="flex flex-col gap-3 group">
      <div className="relative w-full aspect-square sm:aspect-[3/4] bg-[#f2f0f1] rounded-[20px] overflow-hidden">
        <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.isOnSale && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">-{discount}%</span>
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
            <><span className="text-sm text-gray-400 line-through">${product.price}</span>
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{discount}%</span></>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Collapsible filter section ─── */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-gray-200 pt-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-3">
        <span className="font-bold text-sm text-black">{title}</span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN SHOP CONTENT
══════════════════════════════════════════════════════════════════════ */
function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  /* ── Read committed params from URL ── */
  const urlCategory  = searchParams.get('category') || '';
  const urlIsOnSale  = searchParams.get('isOnSale') === 'true';
  const urlMinPrice  = Number(searchParams.get('minPrice') || '0');
  const urlMaxPrice  = Number(searchParams.get('maxPrice') || '500');
  const urlSort      = searchParams.get('sort') || 'most-popular';
  const urlPage      = Number(searchParams.get('page') || '1');
  const urlSearch    = searchParams.get('search') || '';
  const urlColors    = useMemo(() =>
    searchParams.get('color') ? searchParams.get('color')!.split(',').filter(Boolean) : [], [searchParams]);
  const urlSizes     = useMemo(() =>
    searchParams.get('size') ? searchParams.get('size')!.split(',').filter(Boolean) : [], [searchParams]);

  /* ── Local "pending" filter state — only committed on Apply Filter ── */
  const [pendingCategory,   setPendingCategory]  = useState(urlCategory);
  const [pendingMinPrice,   setPendingMinPrice]   = useState(urlMinPrice);
  const [pendingMaxPrice,   setPendingMaxPrice]   = useState(urlMaxPrice);
  const [pendingColors,     setPendingColors]     = useState<string[]>(urlColors);
  const [pendingSizes,      setPendingSizes]      = useState<string[]>(urlSizes);
  const [pendingDressStyle, setPendingDressStyle] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync pending state if URL changes externally (e.g. browser back)
  useEffect(() => {
    setPendingCategory(urlCategory);
    setPendingMinPrice(urlMinPrice);
    setPendingMaxPrice(urlMaxPrice);
    setPendingColors(urlColors);
    setPendingSizes(urlSizes);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  /* ── Push all pending filters to URL at once ── */
  const commitFilters = () => {
    const params = new URLSearchParams();
    if (pendingCategory)         params.set('category',  pendingCategory);
    if (urlIsOnSale)             params.set('isOnSale',  'true');
    if (pendingMinPrice > 0)     params.set('minPrice',  String(pendingMinPrice));
    if (pendingMaxPrice < 500)   params.set('maxPrice',  String(pendingMaxPrice));
    if (pendingColors.length)    params.set('color',     pendingColors.join(','));
    if (pendingSizes.length)     params.set('size',      pendingSizes.join(','));
    if (urlSearch.trim())        params.set('search',    urlSearch.trim());
    if (pendingDressStyle)       params.set('category',  pendingDressStyle);
    params.set('sort', urlSort);
    params.set('page', '1');
    router.replace(`/shop?${params.toString()}`);
    setSidebarOpen(false);
  };

  /* ── Sort change (immediate, no Apply needed) ── */
  const sortLabelToQuery: Record<string, string> = {
    'Most Popular': 'most-popular', 'Newest': 'newest',
    'Price: Low to High': 'price-asc', 'Price: High to Low': 'price-desc',
  };
  const sortQueryToLabel: Record<string, string> = Object.fromEntries(
    Object.entries(sortLabelToQuery).map(([k, v]) => [v, k])
  );
  const handleSortChange = (label: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sortLabelToQuery[label] || 'most-popular');
    params.set('page', '1');
    router.replace(`/shop?${params.toString()}`);
  };

  /* ── Toggle pending color / size ── */
  const togglePendingColor = (c: string) =>
    setPendingColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const togglePendingSize = (s: string) =>
    setPendingSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  /* ── Build API query from COMMITTED URL params ── */
  const queryParams: ProductQueryParams = {
    page: urlPage, limit: 9, sort: urlSort,
  };
  if (urlCategory)          queryParams.category = urlCategory;
  if (urlIsOnSale)          queryParams.isOnSale = true;
  if (urlMinPrice > 0)      queryParams.minPrice = urlMinPrice;
  if (urlMaxPrice < 500)    queryParams.maxPrice = urlMaxPrice;
  if (urlColors.length)     queryParams.color    = urlColors.join(',');
  if (urlSizes.length)      queryParams.size     = urlSizes.join(',');
  if (urlSearch.trim())     queryParams.search   = urlSearch.trim();

  const { data, isLoading, isFetching } = useGetProductsQuery(queryParams);
  const products     = data?.products || [];
  const totalPages   = data?.pages    || 1;
  const totalProducts = data?.total   || 0;

  const CATEGORIES   = ['T-shirts', 'Shorts', 'Shirts', 'Hoodie', 'Jeans'];
  const COLORS       = ['#00c12b','#f50000','#f5dd00','#ff7900','#0000cc','#862fdb','#ff4789','#000000','#f5f5f5'];
  const SIZES        = ['XX-Small','X-Small','Small','Medium','Large','X-Large','XX-Large','3X-Large','4X-Large'];
  const DRESS_STYLES = ['Casual','Formal','Party','Gym'];

  const breadcrumbLabel = urlSearch
    ? `Search: "${urlSearch}"`
    : urlCategory || (urlIsOnSale ? 'Sale' : 'All Products');

  const pageNumbers = () => {
    const nums: (number | '...')[] = [];
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
      if (i === 1 || i === totalPages || (i >= urlPage - 1 && i <= urlPage + 1)) nums.push(i);
      else if (nums[nums.length - 1] !== '...') nums.push('...');
    }
    return nums;
  };

  /* ── Initial full-page loader ── */
  if (isLoading && products.length === 0) return <PageLoader message="Loading products..." />;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6 font-['Satoshi']">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-black font-medium capitalize">{breadcrumbLabel}</span>
      </nav>

      <div className="flex gap-6 items-start">
        {/* ════════════════ FILTER SIDEBAR ════════════════ */}
        <aside className={`
          shrink-0 w-64 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4
          fixed lg:static inset-y-0 left-0 z-40 overflow-y-auto transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0 shadow-2xl top-0 h-full' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-black">Filters</h3>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1">
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setPendingCategory(pendingCategory === cat ? '' : cat)}
                className={`flex items-center justify-between py-1.5 text-sm transition-colors ${
                  pendingCategory === cat ? 'text-black font-bold' : 'text-gray-600 hover:text-black'
                }`}>
                <span>{cat}</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>

          {/* Price */}
          <FilterSection title="Price">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>${pendingMinPrice}</span>
                <span>${pendingMaxPrice}</span>
              </div>
              <div className="relative h-1.5 bg-gray-200 rounded-full">
                <div 
                  className="absolute h-full bg-black rounded-full"
                  style={{
                    left: `${(pendingMinPrice / 500) * 100}%`,
                    right: `${100 - (pendingMaxPrice / 500) * 100}%`
                  }}
                />
                <input 
                  type="range" 
                  min={0} 
                  max={500} 
                  value={pendingMinPrice}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val < pendingMaxPrice) setPendingMinPrice(val);
                  }}
                  className="absolute w-full h-1.5 opacity-0 cursor-pointer z-10"
                  style={{ pointerEvents: 'all' }}
                />
                <input 
                  type="range" 
                  min={0} 
                  max={500} 
                  value={pendingMaxPrice}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val > pendingMinPrice) setPendingMaxPrice(val);
                  }}
                  className="absolute w-full h-1.5 opacity-0 cursor-pointer z-10"
                  style={{ pointerEvents: 'all' }}
                />
                {/* Min thumb */}
                <div 
                  className="absolute w-5 h-5 bg-black border-2 border-white rounded-full shadow-md -top-1.5 -ml-2.5 pointer-events-none z-20"
                  style={{ left: `${(pendingMinPrice / 500) * 100}%` }}
                />
                {/* Max thumb */}
                <div 
                  className="absolute w-5 h-5 bg-black border-2 border-white rounded-full shadow-md -top-1.5 -ml-2.5 pointer-events-none z-20"
                  style={{ left: `${(pendingMaxPrice / 500) * 100}%` }}
                />
              </div>
            </div>
          </FilterSection>

          {/* Colors */}
          <FilterSection title="Colors">
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => togglePendingColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    pendingColors.includes(c) ? 'border-black scale-110 shadow-md' : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </FilterSection>

          {/* Size */}
          <FilterSection title="Size">
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map(s => (
                <button key={s} onClick={() => togglePendingSize(s)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                    pendingSizes.includes(s)
                      ? 'bg-black text-white border-black'
                      : 'bg-[#f0f0f0] text-gray-700 border-transparent hover:border-gray-400'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Dress Style */}
          <FilterSection title="Dress Style">
            <div className="flex flex-col gap-1">
              {DRESS_STYLES.map(ds => (
                <button key={ds} onClick={() => setPendingDressStyle(pendingDressStyle === ds ? '' : ds)}
                  className={`flex items-center justify-between py-1.5 text-sm transition-colors ${
                    pendingDressStyle === ds ? 'text-black font-bold' : 'text-gray-600 hover:text-black'
                  }`}>
                  <span>{ds}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </FilterSection>

          {/* ── Apply Filter button — commits all pending state to URL ── */}
          <button onClick={commitFilters}
            className="w-full bg-black text-white rounded-full py-3 text-sm font-bold hover:bg-gray-800 transition-colors mt-1 sticky bottom-4">
            Apply Filter
          </button>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ════════════════ PRODUCT GRID ════════════════ */}
        <main className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-black capitalize">{breadcrumbLabel}</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Showing {products.length > 0 ? ((urlPage - 1) * 9) + 1 : 0}–{Math.min(urlPage * 9, totalProducts)} of {totalProducts} Products
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter button */}
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium">
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 hidden sm:block">Sort by:</span>
                <select value={sortQueryToLabel[urlSort] || 'Most Popular'}
                  onChange={e => handleSortChange(e.target.value)}
                  className="bg-transparent text-sm font-semibold outline-none border-b border-gray-300 pb-0.5 cursor-pointer">
                  <option>Most Popular</option>
                  <option>Newest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filters badges */}
          {(urlCategory || urlColors.length > 0 || urlSizes.length > 0 || urlIsOnSale) && (
            <div className="flex flex-wrap gap-2">
              {urlCategory && (
                <span className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">
                  {urlCategory}
                  <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.delete('category'); router.replace(`/shop?${p}`); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {urlSizes.map(s => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-full">
                  {s}
                  <button onClick={() => { const p = new URLSearchParams(searchParams.toString()); const next = urlSizes.filter(x => x !== s); next.length ? p.set('size', next.join(',')) : p.delete('size'); router.replace(`/shop?${p}`); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button onClick={() => router.replace('/shop')} className="px-3 py-1 text-xs text-red-600 font-bold hover:underline">
                Clear All
              </button>
            </div>
          )}

          {/* Grid — show skeleton while re-fetching */}
          {(isLoading || isFetching) ? (
            <ProductGridSkeleton count={9} />
          ) : products.length === 0 ? (
            <div className="w-full py-20 flex flex-col items-center gap-3 bg-gray-50 rounded-2xl text-center">
              <Search className="w-10 h-10 text-gray-200" />
              <p className="font-bold text-gray-700">No products found</p>
              <p className="text-xs text-gray-400">Try a different search term or adjust your filters.</p>
              <button onClick={() => router.replace('/shop')}
                className="mt-2 px-6 py-2 bg-black text-white rounded-full text-xs font-bold">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p: ProductItem) => <CatalogCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
              <button disabled={urlPage <= 1}
                onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set('page', String(urlPage - 1)); router.replace(`/shop?${p}`); }}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all">
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex items-center gap-1">
                {pageNumbers().map((num, i) =>
                  num === '...' ? <span key={i} className="px-2 text-gray-400">...</span> : (
                    <button key={num}
                      onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set('page', String(num)); router.replace(`/shop?${p}`); }}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${urlPage === num ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
                      {num}
                    </button>
                  )
                )}
              </div>
              <button disabled={urlPage >= totalPages}
                onClick={() => { const p = new URLSearchParams(searchParams.toString()); p.set('page', String(urlPage + 1)); router.replace(`/shop?${p}`); }}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-black hover:text-white hover:border-black transition-all">
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
    <Suspense fallback={<PageLoader message="Loading shop..." />}>
      <ShopCatalogContent />
    </Suspense>
  );
}
