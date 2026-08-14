'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductByIdQuery, useGetProductsQuery, useCreateReviewMutation } from '@/store/services/productsApi';
import { useAddToCartBackendMutation } from '@/store/services/cartApi';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductDetailSkeleton } from '@/components/ui/skeletons/ProductDetailSkeleton';
import { RootState } from '@/store/store';
import { Award, ChevronRight, Minus, Plus, Star } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

/* ─── Stars helper ─── */
function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`${px} ${i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Horizontal product card (You Might Also Like) ─── */
function RelatedCard({ product }: { product: any }) {
  const img = product.images?.[0] || '/images/7.png';
  const price = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  return (
    <Link href={`/shop/${product._id}`} className="flex flex-col gap-3 group min-w-[180px]">
      <div className="relative w-full aspect-square bg-[#f2f0f1] rounded-[20px] overflow-hidden">
        <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.isOnSale && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
      </div>
      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-sm text-black line-clamp-1">{product.name}</h3>
        <Stars rating={product.rating || 4.5} />
        <div className="flex items-center gap-2">
          <span className="font-bold text-base text-black">${price}</span>
          {product.isOnSale && <span className="text-sm text-gray-400 line-through">${product.price}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: product, isLoading, error } = useGetProductByIdQuery(id as string);
  const { data: relatedData } = useGetProductsQuery({ limit: 4, sort: 'rating' });
  const relatedProducts = relatedData?.products?.filter((p: any) => p._id !== id).slice(0, 4) || [];

  const { data: allProductsData } = useGetProductsQuery({ limit: 100 });
  const variants = allProductsData?.products?.filter((p: any) => p.name === product?.name) || [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Large');
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'currency' | 'points'>('currency');
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faq'>('reviews');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  const [addToCartBackend] = useAddToCartBackendMutation();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  React.useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    socket.on('new_review', (data: { productId: string; review: any }) => {
      if (data.productId === id) {
        toast.success(`New review added by ${data.review.name}!`, { icon: '⭐' });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  React.useEffect(() => {
    if (product) {
      const initialColorIndex = product.color ? parseInt(product.color, 10) : 0;
      setSelectedColor(isNaN(initialColorIndex) ? 0 : initialColorIndex);
      setSelectedSize(product.size || 'Large');
    }
  }, [product]);

  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link href="/shop" className="mt-4 inline-block px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const effectivePrice = product.isOnSale ? product.salePrice : product.price;
  const discount = product.isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const isLoyaltyOnly = product.purchaseType === 'loyalty_only';
  const isHybrid = product.purchaseType === 'hybrid';
  const isOutOfStock = product.stock <= 0;
  const images = product.images?.length > 0 ? product.images : ['/images/30.png', '/images/31.png', '/images/32.png'];

  const sizes: string[] = (product.sizes && product.sizes.length > 0)
    ? product.sizes
    : product.size
      ? [product.size]
      : ['Small', 'Medium', 'Large', 'X-Large'];

  const colors = ['#4B5320', '#314F40', '#4F46E5'];

  const handleColorClick = (colorIndex: number) => {
    setSelectedColor(colorIndex);
    const matchingVariant = variants.find(
      (v: any) => v.color === colorIndex.toString()
    );
    if (matchingVariant && matchingVariant._id !== product._id) {
      router.push(`/shop/${matchingVariant._id}`);
    }
  };

  const handleSizeClick = (sizeName: string) => {
    setSelectedSize(sizeName);
    const matchingVariant = variants.find(
      (v: any) => v.size === sizeName && v._id !== product._id
    );
    if (matchingVariant) {
      router.push(`/shop/${matchingVariant._id}`);
    }
  };

  const handleAddToCart = async () => {
    if (isAdding || isOutOfStock) return;

    // ── Auth guard: must be logged in to purchase ──
    const rawToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!rawToken) {
      toast.error('Please register or login first to add items to cart!', { icon: '🔒' });
      return;
    }

    setIsAdding(true);
    const method = isLoyaltyOnly ? 'points' : paymentMethod;

    try {
      // Save to local Redux store
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price: effectivePrice,
        salePrice: product.salePrice,
        isOnSale: product.isOnSale,
        pointsPrice: product.pointsPrice || 0,
        purchaseType: product.purchaseType,
        image: images[0],
        quantity,
        paymentMethod: method,
        size: selectedSize,
        color: selectedColor.toString(),
      }));

      // If token exists, sync with backend database
      const rawToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (rawToken) {
        await addToCartBackend({
          productId: product._id,
          name: product.name,
          price: effectivePrice,
          pointsPrice: product.pointsPrice || 0,
          quantity,
          paymentMethod: method,
          size: selectedSize,
          color: selectedColor.toString(),
          image: images[0],
        }).unwrap();
      }

      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } catch (err: any) {
      console.error('Failed to sync cart item to backend database:', err);
      toast.error(err?.data?.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!user) {
      setReviewError('Please login to leave a review.');
      return;
    }
    if (newRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Please enter a comment.');
      return;
    }
    try {
      await createReview({
        id: product._id,
        rating: newRating,
        comment: newComment.trim(),
      }).unwrap();
      setShowReviewModal(false);
      setNewComment('');
      setNewRating(0);
      toast.success('Review submitted successfully!');
    } catch (err: any) {
      setReviewError(err?.data?.message || 'Failed to submit review');
    }
  };

  const defaultReviews = [
    { name: 'Samantha D.', rating: 4, verified: true, date: 'August 14, 2023', text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite 'go to' shirt." },
    { name: 'Alex M.', rating: 4, verified: true, date: 'August 15, 2023', text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me." },
    { name: 'Ethan R.', rating: 4, verified: true, date: 'August 16, 2023', text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalist yet stylish pattern caught my eye, and I'm glad I made the purchase!" },
  ];

  const dbReviews = product?.reviews && product.reviews.length > 0
    ? product.reviews.map((r: any) => ({
        name: r.name,
        rating: r.rating,
        verified: r.verified !== false,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently',
        rawDate: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
        text: r.text,
      }))
    : [];

  const rawReviews = [...dbReviews, ...defaultReviews.map((r: any, idx: number) => ({ ...r, rawDate: idx }))];

  const displayReviews = [...rawReviews].sort((a: any, b: any) => {
    if (sortOrder === 'latest') return b.rawDate - a.rawDate;
    return a.rawDate - b.rawDate;
  });

  return (
    <div className="w-full font-['Satoshi']">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black">Men's</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-medium">T-shirts</span>
        </nav>

        {/* ─── Product Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 relative w-[100px] h-[110px] sm:w-[110px] sm:h-[130px] bg-[#f2f0f1] rounded-[12px] overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-black' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative aspect-square sm:aspect-[3/4] bg-[#f2f0f1] rounded-[20px] overflow-hidden">
              <Image src={images[selectedImage] || images[0]} alt={product.name} fill className="object-cover" priority />
              {product.isOnSale && (
                <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Details panel */}
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl lg:text-[40px] font-extrabold text-black leading-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <Stars rating={product.rating || 4.5} />
              <span className="text-sm font-semibold text-black">{product.rating || 4.5}</span>
              <span className="text-sm text-gray-400">/5</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 pb-5 border-b border-gray-200">
              <span className="text-3xl font-bold text-black">${effectivePrice}</span>
              {product.isOnSale && (
                <>
                  <span className="text-2xl font-bold text-gray-300 line-through">${product.price}</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || 'This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.'}
            </p>

            {/* Color selection */}
            <div className="pb-4 border-b border-gray-200">
              <p className="text-xs text-gray-900 font-bold mb-3">Select Colors</p>
              <div className="flex items-center gap-3">
                {colors.map((c, i) => {
                  return (
                    <button
                      key={c}
                      onClick={() => handleColorClick(i)}
                      className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === i ? 'border-black ring-2 ring-black/20 scale-105' : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {selectedColor === i && (
                        <svg className="w-4 h-4 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size selection */}
            <div className="pb-5 border-b border-gray-200">
              <p className="text-xs text-gray-900 font-bold mb-3">Choose Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => {
                  const isSelected = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => handleSizeClick(sz)}
                      className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all duration-300 ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-md scale-105'
                          : 'bg-[#f0f0f0] text-gray-800 border-transparent hover:bg-gray-200 hover:text-black'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hybrid selector */}
            {isHybrid && (
              <div className="flex gap-3 pb-4 border-b border-gray-200">
                <button
                  onClick={() => setPaymentMethod('currency')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'currency' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  Pay ${effectivePrice}
                </button>
                <button
                  onClick={() => setPaymentMethod('points')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${paymentMethod === 'points' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-300'}`}
                >
                  <Award className="w-4 h-4 inline mr-1" />{product.pointsPrice} pts
                </button>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-4">
              <div className="flex items-center justify-between bg-[#f0f0f0] rounded-full px-5 py-3.5 w-36 shrink-0">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg font-bold leading-none">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-lg font-bold leading-none">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                disabled={isOutOfStock || isAdding || added}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                  isOutOfStock
                    ? 'bg-gray-300 text-gray-500'
                    : added
                    ? 'bg-green-600 text-white scale-[1.02] shadow-lg'
                    : isAdding
                    ? 'bg-gray-800 text-white opacity-90'
                    : isLoyaltyOnly
                    ? 'bg-amber-500 hover:bg-amber-600 active:scale-95 text-white shadow-md'
                    : 'bg-black hover:bg-gray-800 active:scale-95 text-white shadow-md'
                }`}
              >
                {isAdding ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : added ? (
                  '✓ Added to Cart!'
                ) : isLoyaltyOnly ? (
                  'Buy with Points'
                ) : (
                  'Add to Cart'
                )}
              </button>
            </div>

            {isLoyaltyOnly && (
              <p className="text-xs text-amber-700 font-medium">
                🏆 Loyalty-Only: Requires {product.pointsPrice} points
              </p>
            )}
          </div>
        </div>

        {/* ─── Tabs ─── */}
        <div className="mt-16 border-t border-gray-200">
          <div className="flex items-center gap-0 border-b border-gray-200">
            {([
              { id: 'details', label: 'Product Details' },
              { id: 'reviews', label: 'Rating & Reviews' },
              { id: 'faq', label: 'FAQs' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-4 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id ? 'border-black text-black font-bold' : 'border-transparent text-gray-500 hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Reviews tab content */}
          {activeTab === 'reviews' && (
            <div className="py-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-black">
                  All Reviews <span className="text-gray-400 font-normal">({displayReviews.length})</span>
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'latest' ? 'oldest' : 'latest')}
                    className={`px-4 py-2 border rounded-full text-xs font-semibold transition-all ${
                      sortOrder === 'latest' ? 'bg-gray-100 border-gray-300 text-black' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {sortOrder === 'latest' ? 'Latest ↓' : 'Oldest ↑'}
                  </button>
                  <button
                    onClick={() => {
                      setReviewError('');
                      setShowReviewModal(true);
                    }}
                    className="px-5 py-2 bg-black text-white rounded-full text-xs font-bold hover:bg-gray-800 transition-all"
                  >
                    Write a Review
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {displayReviews.map((r: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 rounded-[20px] p-6 flex flex-col gap-3">
                    <Stars rating={r.rating} />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-black">{r.name}</span>
                      {r.verified && <span className="text-green-500 text-base font-bold">✓</span>}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                    <p className="text-xs text-gray-400">Posted on {r.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Write Review Modal ─── */}
          {showReviewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-xl font-bold text-black">Write a Review</h3>
                  <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-black font-bold text-lg">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                  {reviewError && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setNewRating(star)} className="p-1 focus:outline-none">
                          <Star className={`w-7 h-7 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Your Review / Comment</label>
                    <textarea
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tell us what you liked or disliked about this product..."
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="flex-1 py-3 bg-black hover:bg-gray-800 text-white rounded-full text-xs font-bold disabled:opacity-50"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="py-8">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold">SKU:</span> <span className="text-gray-600">{product.sku}</span></div>
                <div><span className="font-bold">Stock:</span> <span className="text-gray-600">{product.stock} units</span></div>
                <div><span className="font-bold">Category:</span> <span className="text-gray-600">{product.category}</span></div>
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="py-8 flex flex-col gap-4">
              {[
                { q: 'What is the return policy?', a: 'We accept returns within 30 days of purchase.' },
                { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days.' },
                { q: 'Is this product machine washable?', a: 'Yes, machine wash cold with like colors.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-gray-100 pb-4">
                  <p className="font-bold text-sm text-black mb-1">{q}</p>
                  <p className="text-sm text-gray-600">{a}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── You Might Also Like ─── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 flex flex-col items-center gap-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}>
              YOU MIGHT ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
              {relatedProducts.map((p: any) => <RelatedCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}