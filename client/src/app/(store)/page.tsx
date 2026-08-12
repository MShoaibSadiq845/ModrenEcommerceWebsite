'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetProductsQuery } from '@/store/services/productsApi';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';
import { Star, Award, ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── Rating Stars helper ─── */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Product Card ─── */
function ProductCard({ product }: { product: any }) {
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <Link href={`/shop/${product._id}`} className="flex flex-col gap-3 group">
      <div className="relative w-full aspect-[3/4] bg-[#f2f0f1] rounded-[20px] overflow-hidden">
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
            <Award className="w-3 h-3" /> Loyalty
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-sm sm:text-base text-black line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <Stars rating={product.rating || 4.5} />
          <span className="text-xs text-gray-500 font-medium">{product.rating || 4.5}/5</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-bold text-lg text-black">${price}</span>
          {product.isOnSale && (
            <span className="font-medium text-sm text-gray-400 line-through">${product.price}</span>
          )}
          {product.isOnSale && (
            <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Horizontal scroll product row ─── */
function ProductRow({ products, loading }: { products: any[]; loading: boolean }) {
  if (loading) return <ProductGridSkeleton count={4} />;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
      {products.slice(0, 4).map((p: any) => <ProductCard key={p._id} product={p} />)}
    </div>
  );
}

/* ─── Section heading ─── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center tracking-tight"
      style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
      {children}
    </h2>
  );
}

/* ─── Main Home Page ─── */
export default function StorefrontHomePage() {
  const { data: newArrivalsData, isLoading: loadingNew } = useGetProductsQuery({ limit: 4, sort: 'newest' });
  const { data: topSellingData, isLoading: loadingTop } = useGetProductsQuery({ limit: 4, sort: 'rating' });
  const reviewsRef = useRef<HTMLDivElement>(null);

  const newArrivals = newArrivalsData?.products || [];
  const topSelling = topSellingData?.products || [];

  const reviews = [
    { name: 'Samantha D.', rating: 5, text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite 'go to' shirt.", date: 'August 14, 2023' },
    { name: 'Alex M.', rating: 4, text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.", date: 'August 15, 2023' },
    { name: 'Ethan R.', rating: 4, text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalist yet stylish pattern caught my eye, and I'm glad I made the purchase!", date: 'August 16, 2023' },
    { name: 'Olivia P.', rating: 5, text: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents it visually but also feels great to wear. It's evident that the designer poured a lot of creativity into making it.", date: 'August 17, 2023' },
    { name: 'Liam K.', rating: 4, text: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of fashion history.", date: 'August 18, 2023' },
    { name: 'Ava H.', rating: 5, text: "I'm not just wearing a shirt; I'm wearing a piece of design philosophy. The intricate details and the overall feel of the design make this shirt a conversation starter.", date: 'August 19, 2023' },
  ];

  const scrollReviews = (dir: 'left' | 'right') => {
    if (!reviewsRef.current) return;
    reviewsRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const dressStyles = [
    { label: 'Casual', img: '/images/15.png', href: '/shop?category=Casual', wide: false },
    { label: 'Formal', img: '/images/16.png', href: '/shop?category=Formal', wide: true },
    { label: 'Party', img: '/images/17.png', href: '/shop?category=Party', wide: true },
    { label: 'Gym', img: '/images/18.png', href: '/shop?category=Gym', wide: false },
  ];

  const brands = [
    { label: 'VERSACE', src: '/images/54.png' },
    { label: 'ZARA', src: '/images/55.png' },
    { label: 'GUCCI', src: '/images/56.png' },
    { label: 'PRADA', src: '/images/57.png' },
    { label: 'Calvin Klein', src: '/images/58.png' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="w-full bg-[#f2f0f1] overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-10 pb-0 lg:pb-0 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Text column */}
          <div className="flex flex-col gap-6 max-w-xl z-10 pb-10 lg:pb-20">
            {/* Decorative sparkles */}
            <div className="relative">
              <div className="absolute -top-6 right-4 lg:right-16 opacity-80">
                <Image src="/images/3.png" width={28} height={28} alt="" />
              </div>
              <div className="absolute top-16 -right-8 opacity-60 scale-75">
                <Image src="/images/4.png" width={18} height={18} alt="" />
              </div>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-black leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your
              individuality and cater to your sense of style.
            </p>
            <Link
              href="/shop"
              className="w-fit px-14 py-4 bg-black text-white rounded-full font-medium text-base hover:bg-gray-900 transition-colors"
            >
              Shop Now
            </Link>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-0 pt-6 border-t border-black/10 divide-x divide-black/10">
              {[
                { value: '200+', label: 'International Brands' },
                { value: '2,000+', label: 'High-Quality Products' },
                { value: '30,000+', label: 'Happy Customers' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1 pr-8 last:pr-0 pl-8 first:pl-0">
                  <span className="text-2xl lg:text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
                    {value}
                  </span>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="relative w-full lg:w-auto flex-shrink-0 flex items-end justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px] lg:max-w-[520px] h-[380px] lg:h-[560px]">
              <Image
                src="/images/59.png"
                alt="Fashion Models"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>
            {/* Right top sparkle */}
            <div className="absolute top-6 right-4 hidden lg:block">
              <Image src="/images/3.png" width={36} height={36} alt="" />
            </div>
            <div className="absolute bottom-24 left-4 hidden lg:block">
              <Image src="/images/4.png" width={22} height={22} alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ BRANDS BAR ═══════════════════ */}
      <section className="w-full bg-black py-7 px-4">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-around gap-6 lg:gap-0">
          {brands.map(({ label, src }) => (
            <div key={label} className="h-8 flex items-center">
              <Image
                src={src}
                alt={label}
                width={120}
                height={32}
                className="object-contain brightness-0 invert opacity-90"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ NEW ARRIVALS ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-10">
        <SectionHeading>NEW ARRIVALS</SectionHeading>
        <ProductRow products={newArrivals} loading={loadingNew} />
        <Link
          href="/shop?sort=newest"
          className="px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all"
        >
          View All
        </Link>
      </section>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <hr className="border-gray-200" />
      </div>

      {/* ═══════════════════ TOP SELLING ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-10">
        <SectionHeading>TOP SELLING</SectionHeading>
        <ProductRow products={topSelling} loading={loadingTop} />
        <Link
          href="/shop?sort=rating"
          className="px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all"
        >
          View All
        </Link>
      </section>

      {/* ═══════════════════ BROWSE BY DRESS STYLE ═══════════════════ */}
      <section className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full max-w-[1440px] mx-auto bg-[#f2f0f1] rounded-[40px] p-6 sm:p-8 lg:p-14 flex flex-col items-center gap-10">
          <SectionHeading>BROWSE BY DRESS STYLE</SectionHeading>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {/* Row 1: Casual (col-1) + Formal (col-2) */}
            <Link
              href="/shop?category=Casual"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1"
            >
              <Image src="/images/15.png" alt="Casual" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

            </Link>
            <Link
              href="/shop?category=Formal"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1 md:col-span-2"
            >
              <Image src="/images/16.png" alt="Formal" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

            </Link>
            {/* Row 2: Party (col-2) + Gym (col-1) */}
            <Link
              href="/shop?category=Party"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1 md:col-span-2"
            >
              <Image src="/images/17.png" alt="Party" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

            </Link>
            <Link
              href="/shop?category=Gym"
              className="relative h-[170px] sm:h-[220px] rounded-[20px] overflow-hidden group bg-white col-span-1"
            >
              <Image src="/images/18.png" alt="Gym" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HAPPY CUSTOMERS ═══════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <SectionHeading>OUR HAPPY CUSTOMERS</SectionHeading>
          <div className="flex gap-2">
            <button
              onClick={() => scrollReviews('left')}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollReviews('right')}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={reviewsRef}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {reviews.map((r) => (
            <div
              key={r.name}
              className="min-w-[300px] sm:min-w-[360px] bg-white border border-gray-200 rounded-[20px] p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              <Stars rating={r.rating} />
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-black">{r.name}</span>
                <span className="text-green-500 text-base">✓</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
              <p className="text-xs text-gray-400">Posted on {r.date}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
