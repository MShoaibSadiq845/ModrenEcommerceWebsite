'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductByIdQuery, useGetProductsQuery } from '@/store/services/productsApi';
import { useAddToCartBackendMutation } from '@/store/services/cartApi';
import { addToCart } from '@/store/slices/cartSlice';
import { ProductDetailSkeleton } from '@/components/ui/skeletons/ProductDetailSkeleton';
import { RootState } from '@/store/store';
import { Award, ChevronRight, Minus, Plus } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faq'>('reviews');

  const [addToCartBackend] = useAddToCartBackendMutation();

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
  const sizes = ['Small', 'Medium', 'Large', 'X-Large'];
  const colors = ['#4B5320', '#314F40', '#31344F'];

  // Check if a color index is supported by ANY variant in the product family
  const isColorSupported = (colorIndex: number) => {
    if (!product || variants.length === 0) return colorIndex === 0;
    return variants.some((v: any) => v.color === colorIndex.toString());
  };

  // Check if a size is supported by ANY variant in the product family
  const isSizeSupported = (sizeName: string) => {
    if (!product || variants.length === 0) return sizeName === 'Large';
    return variants.some((v: any) => v.size === sizeName);
  };

  const handleColorClick = (colorIndex: number) => {
    let matchingVariant = variants.find(
      (v: any) => v.color === colorIndex.toString() && v.size === selectedSize
    );
    if (!matchingVariant) {
      matchingVariant = variants.find(
        (v: any) => v.color === colorIndex.toString()
      );
    }

    if (matchingVariant) {
      setSelectedColor(colorIndex);
      if (matchingVariant._id !== product._id) {
        router.push(`/shop/${matchingVariant._id}`);
      }
    } else {
      alert("Not available at this time");
    }
  };

  const handleSizeClick = (sizeName: string) => {
    let matchingVariant = variants.find(
      (v: any) => v.color === selectedColor.toString() && v.size === sizeName
    );
    if (!matchingVariant) {
      matchingVariant = variants.find(
        (v: any) => v.size === sizeName
      );
    }

    if (matchingVariant) {
      setSelectedSize(sizeName);
      if (matchingVariant._id !== product._id) {
        router.push(`/shop/${matchingVariant._id}`);
      }
    } else {
      alert("Not available at this time");
    }
  };

  const handleAddToCart = async () => {
    const method = isLoyaltyOnly ? 'points' : paymentMethod;
    
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
      try {
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
      } catch (err: any) {
        console.error('Failed to sync cart item to backend database:', err);
      }
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const reviews = [
    { name: 'Samantha D.', rating: 4, verified: true, date: 'August 14, 2023', text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite 'go to' shirt." },
    { name: 'Alex M.', rating: 4, verified: true, date: 'August 15, 2023', text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I'm quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me." },
    { name: 'Ethan R.', rating: 4, verified: true, date: 'August 16, 2023', text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalist yet stylish pattern caught my eye, and I'm glad I made the purchase!" },
    { name: 'Olivia P.', rating: 5, verified: true, date: 'August 17, 2023', text: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents it visually but also feels great to wear. It's evident that the designer poured a lot of creativity into making it." },
    { name: 'Liam K.', rating: 4, verified: true, date: 'August 18, 2023', text: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill. It's like wearing a piece of fashion history." },
    { name: 'Ava H.', rating: 5, verified: true, date: 'August 19, 2023', text: "I'm not just wearing a shirt; I'm wearing a piece of design philosophy. The intricate details and the overall feel of the design make this shirt a conversation starter." },
  ];

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
              <p className="text-xs text-gray-600 font-medium mb-3">Select Colors</p>
              <div className="flex items-center gap-3">
                {colors.map((c, i) => {
                  const supported = isColorSupported(i);
                  return (
                    <button
                      key={c}
                      onClick={() => handleColorClick(i)}
                      className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColor === i ? 'border-black' : 'border-transparent'
                      } ${!supported ? 'opacity-30' : ''}`}
                      style={{ backgroundColor: c }}
                      title={!supported ? 'Not available at this time' : ''}
                    >
                      {selectedColor === i && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <p className="text-xs text-gray-600 font-medium mb-3">Choose Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => {
                  const supported = isSizeSupported(sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => handleSizeClick(sz)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                        selectedSize === sz
                          ? 'bg-black text-white'
                          : 'bg-[#f0f0f0] text-gray-700 hover:bg-gray-200'
                      } ${!supported ? 'opacity-35' : ''}`}
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
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                    paymentMethod === 'currency' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Pay ${effectivePrice}
                </button>
                <button
                  onClick={() => setPaymentMethod('points')}
                  className={`flex-1 py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                    paymentMethod === 'points' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-300'
                  }`}
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
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-3.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 ${
                  isLoyaltyOnly
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : added
                    ? 'bg-green-600 text-white'
                    : 'bg-black hover:bg-gray-800 text-white'
                }`}
              >
                {added ? '✓ Added to Cart!' : isLoyaltyOnly ? 'Buy with Points' : 'Add to Cart'}
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
                  activeTab === tab.id
                    ? 'border-black text-black font-bold'
                    : 'border-transparent text-gray-500 hover:text-black'
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
                <p className="text-sm font-bold text-black">All Reviews <span className="text-gray-400 font-normal">({reviews.length})</span></p>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 border border-gray-200 rounded-full text-xs font-medium hover:bg-gray-50">
                    Latest
                  </button>
                  <button className="px-5 py-2 bg-black text-white rounded-full text-xs font-bold">
                    Write a Review
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {reviews.map((r) => (
                  <div key={r.name} className="border border-gray-200 rounded-[20px] p-6 flex flex-col gap-3">
                    <Stars rating={r.rating} />
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-black">{r.name}</span>
                      {r.verified && <span className="text-green-500 text-base">✓</span>}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                    <p className="text-xs text-gray-400">Posted on {r.date}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-2">
                <button className="px-10 py-3 border border-gray-200 rounded-full text-sm font-medium hover:bg-black hover:text-white transition-all">
                  Load More Reviews
                </button>
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
