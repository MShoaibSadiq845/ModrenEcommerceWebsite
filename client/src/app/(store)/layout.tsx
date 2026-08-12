import React from 'react';
import { StorefrontHeader } from '@/components/storefront/Header';
import { StorefrontFooter } from '@/components/storefront/Footer';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-black font-['Satoshi']">
      <StorefrontHeader />
      <main className="flex-1 w-full">{children}</main>
      <StorefrontFooter />
    </div>
  );
}