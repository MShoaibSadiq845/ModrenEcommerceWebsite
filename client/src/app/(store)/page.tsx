'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { useGetProductsQuery, useGetAllReviewsQuery } from '@/store/services/productsApi';
import { useDispatch } from 'react-redux';
import { apiSlice } from '@/store/services/api';
import { ProductGridSkeleton } from '@/components/ui/skeletons/ProductCardSkeleton';
import { Award, ChevronLeft, ChevronRight } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

/* ─── Stars helper ─────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${
            i < full
              ? 'text-amber-400'
              : i === full && hasHalf
              ? 'text-amber-300'
              : 'text-gray-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Product Card ─────────────────────────────────────────── */
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

/* ─── Section heading ──────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-center tracking-tight"
      style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
    >
      {children}
    </h2>
  );
}

/* ─── Review card ──────────────────────────────────────────── */
interface ReviewItem {
  _id?: string;
  name: string;
  rating: number;
  text: string;
  verified?: boolean;
  createdAt?: string;
  productName?: string;
  isNew?: boolean;
}

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <div
      className={`min-w-[300px] sm:min-w-[340px] max-w-[340px] bg-white border rounded-[20px] p-6 flex flex-col gap-3 hover:shadow-md transition-all shrink-0
        ${review.isNew ? 'border-amber-400 shadow-amber-100 shadow-md animate-pulse-once' : 'border-gray-200'}`}
    >
      <Stars rating={review.rating} />
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-black">{review.name}</span>
        {review.verified !== false && (
          <span className="text-green-500 text-base font-bold">✓</span>
        )}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">{review.text}</p>
      <div className="flex items-center justify-between mt-auto pt-1">
        {review.productName && (
          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
            Re: {review.productName}
          </span>
        )}
        <span className="text-xs text-gray-400 shrink-0">
          {review.createdAt
            ? new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })
            : ''}
        </span>
      </div>
    </div>
  );
}

const FALLBACK_REVIEWS: ReviewItem[] = [
  { name: 'Samantha D.', rating: 5, text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable.", createdAt: '2023-08-14', verified: true },
  { name: 'Alex M.', rating: 4, text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch.", createdAt: '2023-08-15', verified: true },
  { name: 'Ethan R.', rating: 4, text: "This t-shirt is a must-have for anyone who appreciates good design.", createdAt: '2023-08-16', verified: true },
  { name: 'Olivia P.', rating: 5, text: "As a UI/UX enthusiast, I value simplicity and functionality.", createdAt: '2023-08-17', verified: true },
  { name: 'Liam K.', rating: 4, text: "The fabric is soft and the design speaks volumes about the designer's skill.", createdAt: '2023-08-18', verified: true },
];

/* ══════════════════════════════════════════════════════════
    HOME PAGE
══════════════════════════════════════════════════════════ */
export default function StorefrontHomePage() {
  const dispatch = useDispatch();
  const { data: newArrivalsData, isLoading: loadingNew } = useGetProductsQuery({ limit: 4, sort: 'newest' });
  const { data: topSellingData, isLoading: loadingTop } = useGetProductsQuery({ limit: 4, sort: 'rating' });

  const { data: dbReviews = [], isLoading: loadingReviews } = useGetAllReviewsQuery(30);

  const [liveReviews, setLiveReviews] = useState<ReviewItem[]>([]);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const newArrivals = newArrivalsData?.products || [];
  const topSelling  = topSellingData?.products  || [];

  useEffect(() => {
    if (dbReviews && (dbReviews as ReviewItem[]).length > 0) {
      setLiveReviews(dbReviews as ReviewItem[]);
    } else if (!loadingReviews) {
      setLiveReviews(FALLBACK_REVIEWS);
    }
  }, [dbReviews, loadingReviews]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('new_review', (data: { productId: string; review: ReviewItem; updatedProduct: any }) => {
      const incoming: ReviewItem = {
        ...data.review,
        productName: data.updatedProduct?.name || '',
        isNew: true,
      };

      setLiveReviews((prev) => [incoming, ...prev].slice(0, 30));

      setTimeout(() => {
        setLiveReviews((prev) =>
          prev.map((r) =>
            r._id === incoming._id || (r.name === incoming.name && r.text === incoming.text)
              ? { ...r, isNew: false }
              : r,
          ),
        );
      }, 4000);

      dispatch(apiSlice.util.invalidateTags(['Product']));
    });

    return () => { socket.disconnect(); };
  }, [dispatch]);

  const scrollReviews = (dir: 'left' | 'right') => {
    reviewsRef.current?.scrollBy({ left: dir === 'left' ? -360 : 360, behavior: 'smooth' });
  };

  const brands = [
    { label: 'VERSACE', src: '/images/54.png' },
    { label: 'ZARA',    src: '/images/55.png' },
    { label: 'GUCCI',   src: '/images/56.png' },
    { label: 'PRADA',   src: '/images/57.png' },
    { label: 'Calvin Klein', src: '/images/58.png' },
  ];

  return (
    <div className="w-full flex flex-col items-center">

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section className="w-full bg-[#f2f0f1] overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-10 pb-0 flex flex-col lg:flex-row items-center justify-between gap-6 relative">
          
          <div className="flex flex-col gap-6 max-w-xl z-10 pb-10 lg:pb-20">
            <h1
              className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-black leading-[1.05] tracking-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              FIND CLOTHES THAT MATCHES YOUR STYLE
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-md">
              Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality.
            </p>
            <Link href="/shop" className="w-fit px-14 py-4 bg-black text-white rounded-full font-medium text-base hover:bg-gray-900 transition-colors">
              Shop Now
            </Link>
            <div className="flex flex-wrap gap-0 pt-6 border-t border-black/10 divide-x divide-black/10">
              {[
                { value: '200+', label: 'International Brands' },
                { value: '2,000+', label: 'High-Quality Products' },
                { value: '30,000+', label: 'Happy Customers' },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1 pr-6 sm:pr-8 last:pr-0 pl-6 sm:pl-8 first:pl-0">
                  <span className="text-2xl lg:text-3xl font-extrabold text-black" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>{value}</span>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image: fixed height so the model is always fully visible */}
          <div className="relative w-full lg:w-[600px] h-[320px] sm:h-[440px] lg:h-[600px] shrink-0 flex items-end justify-center">
            {/* Decorative spark top-right — uses /images/3.png (4-point star) */}
            <div className="absolute top-4 right-2 lg:right-10 z-20 pointer-events-none">
              <Image src="/images/3.png" alt="" width={44} height={44} />
            </div>
            {/* Decorative spark small — uses /images/4.png (small star) */}
            <div className="absolute top-48 left-0 lg:-left-4 z-20 pointer-events-none">
              <Image src="/images/4.png" alt="" width={22} height={22} />
            </div>
            <Image
              src="/images/51.png"
              alt="Fashion Models"
              fill
              className="object-contain object-bottom"
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
            />
          </div>

        </div>
      </section>

      {/* ═══ BRANDS BAR ══════════════════════════════════════════════════════ */}
      <section className="w-full bg-black py-7 px-4">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-around gap-6 lg:gap-0">
          {brands.map(({ label, src }) => (
            <div key={label} className="h-8 flex items-center">
              <Image src={src} alt={label} width={120} height={32} className="object-contain brightness-0 invert opacity-90" />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ NEW ARRIVALS ════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-10">
        <SectionHeading>NEW ARRIVALS</SectionHeading>
        {loadingNew ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
            {newArrivals.slice(0, 4).map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        <Link href="/shop?sort=newest" className="px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">
          View All
        </Link>
      </section>

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <hr className="border-gray-200" />
      </div>

      {/* ═══ TOP SELLING ═════════════════════════════════════════════════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 flex flex-col items-center gap-10">
        <SectionHeading>TOP SELLING</SectionHeading>
        {loadingTop ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
            {topSelling.slice(0, 4).map((p: any) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        <Link href="/shop?sort=rating" className="px-16 py-3.5 border border-gray-300 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">
          View All
        </Link>
      </section>

      {/* ═══ BROWSE BY DRESS STYLE (Fully Responsive) ═════════════════════════ */}
      <section className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full max-w-[1440px] mx-auto bg-[#f2f0f1] rounded-[40px] p-6 sm:p-10 lg:p-16 flex flex-col items-center gap-10">
          <SectionHeading>BROWSE BY DRESS STYLE</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            
            {/* Casual */}
            <Link href="/shop?category=Casual" className="relative h-[220px] sm:h-[280px] rounded-[30px] overflow-hidden group bg-white col-span-1 p-6 sm:p-8 flex flex-col shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>Casual</span>
              <Image src="/images/62.png" alt="Casual" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>

            {/* Formal */}
            <Link href="/shop?category=Formal" className="relative h-[220px] sm:h-[280px] rounded-[30px] overflow-hidden group bg-white col-span-1 md:col-span-2 p-6 sm:p-8 flex flex-col shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>Formal</span>
              <Image src="/images/64.png" alt="Formal" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>

            {/* Party */}
            <Link href="/shop?category=Party" className="relative h-[220px] sm:h-[280px] rounded-[30px] overflow-hidden group bg-white col-span-1 md:col-span-2 p-6 sm:p-8 flex flex-col shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>Party</span>
              <Image src="/images/65.png" alt="Party" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>

            {/* Gym */}
            <Link href="/shop?category=Gym" className="relative h-[220px] sm:h-[280px] rounded-[30px] overflow-hidden group bg-white col-span-1 p-6 sm:p-8 flex flex-col shadow-sm">
              <span className="text-2xl sm:text-3xl font-extrabold text-black z-10" style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>Gym</span>
              <Image src="/images/63.png" alt="Gym" fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
            </Link>

          </div>
        </div>
      </section>

      {/* ═══ OUR HAPPY CUSTOMERS ═════════════════════════════════════════════ */}
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

        {liveReviews.length > 0 && !loadingReviews && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>
              {liveReviews.filter(r => r.isNew).length > 0
                ? `${liveReviews.filter(r => r.isNew).length} new review just posted!`
                : `${liveReviews.length} verified reviews · updates in real-time`}
            </span>
          </div>
        )}

        {loadingReviews && (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[300px] sm:min-w-[340px] h-48 bg-gray-100 rounded-[20px] animate-pulse shrink-0" />
            ))}
          </div>
        )}

        {!loadingReviews && (
          <div
            ref={reviewsRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {liveReviews.map((r, idx) => (
              <ReviewCard key={r._id || `${r.name}-${idx}`} review={r} />
            ))}

            {liveReviews.length === 0 && (
              <div className="w-full text-center py-12 text-gray-400 text-sm">
                No customer reviews yet. Be the first to review a product!
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}