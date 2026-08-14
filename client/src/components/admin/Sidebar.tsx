'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  LayoutDashboard, ShoppingBag, ShoppingCart,
  Bell, PlusCircle, ArrowLeft, Users, Tag, X,
} from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: Props) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.role === 'Super Admin';

  const navItems = [
    { label: 'Dashboard',    href: '/admin',              icon: LayoutDashboard },
    { label: 'Products',     href: '/admin/products',     icon: ShoppingBag },
    { label: 'Add Product',  href: '/admin/products/add', icon: PlusCircle },
    { label: 'Orders',       href: '/admin/orders',       icon: ShoppingCart },
    { label: 'Coupons',      href: '/admin/coupons',      icon: Tag },
    { label: 'Notifications',href: '/admin/notifications',icon: Bell },
    ...(isSuperAdmin ? [{ label: 'Users', href: '/admin/users', icon: Users }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 h-full bg-white border-r border-gray-200 flex flex-col justify-between p-5 font-['Rubik']">
      <div className="flex flex-col gap-7">
        {/* Brand + close btn */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-lg">A</div>
            <div>
              <h1 className="font-bold text-sm leading-tight text-gray-900">SHOP.CO Admin</h1>
              <p className="text-[10px] text-gray-400">{user?.role || 'Store Management'}</p>
            </div>
          </div>
          {/* Close button — only visible on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-5 border-t border-gray-100">
        <Link
          href="/shop"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </Link>
      </div>
    </aside>
  );
}
