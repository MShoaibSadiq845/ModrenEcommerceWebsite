'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const footerLinks = {
  company: ['About', 'Features', 'Works', 'Career'],
  help: ['Customer Support', 'Delivery Details', 'Terms & Conditions', 'Privacy Policy'],
  faq: ['Account', 'Manage Deliveries', 'Orders', 'Payments'],
  resources: ['Free eBooks', 'Development Tutorial', 'How to - Blog', 'Youtube Playlist'],
};

export function StorefrontFooter() {
  return (
    <footer className="w-full bg-[#f0f0f0] pt-14 pb-8 font-['Satoshi'] text-black">
      {/* ─── Newsletter Banner ─── */}
      <div className="w-full bg-black mx-0 mb-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight max-w-sm"
            style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
          >
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h2>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white rounded-full py-3 pl-10 pr-4 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <button className="w-full bg-white text-black rounded-full py-3 text-sm font-semibold hover:bg-gray-100 transition-colors">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* ─── Footer columns ─── */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 border-b border-gray-300 pb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <h2
              className="text-2xl font-extrabold"
              style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
            >
              SHOP.CO
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed max-w-[200px]">
              We have clothes that suits your style and which you're proud to wear. From women to men.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { img: '/images/21.png', alt: 'Twitter', href: '#' },
                { img: '/images/22.png', alt: 'Facebook', href: '#' },
                { img: '/images/23.png', alt: 'Instagram', href: '#' },
                { img: '/images/89.png', alt: 'GitHub', href: '#' },
              ].map(({ img, alt, href }) => (
                <Link key={alt} href={href} aria-label={alt}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center hover:border-black transition-colors overflow-hidden"
                >
                  <Image src={img} width={18} height={18} alt={alt} className="object-contain" />
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">COMPANY</h4>
            {footerLinks.company.map((item) => (
              <Link key={item} href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* Help */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">HELP</h4>
            {footerLinks.help.map((item) => (
              <Link key={item} href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* FAQ */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">FAQ</h4>
            {footerLinks.faq.map((item) => (
              <Link key={item} href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                {item}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-widest uppercase">RESOURCES</h4>
            {footerLinks.resources.map((item) => (
              <Link key={item} href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* ─── Bottom bar ─── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">Shop.co © 2000-2025, All Rights Reserved</p>
          <div className="flex items-center gap-2">
            {[
              { src: '/images/25.png', alt: 'Visa' },
              { src: '/images/26.png', alt: 'Mastercard' },
              { src: '/images/27.png', alt: 'PayPal' },
              { src: '/images/28.png', alt: 'Apple Pay' },
              { src: '/images/29.png', alt: 'Google Pay' },
            ].map(({ src, alt }) => (
              <div key={alt} className="h-7 px-2  flex items-center justify-center">
                <Image src={src} width={38} height={24} alt={alt} className="object-contain" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
