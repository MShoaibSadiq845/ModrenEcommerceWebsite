'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/store/services/notificationsApi';
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  Award,
  Search,
  X,
  ChevronDown,
  Bell,
} from 'lucide-react';

export function StorefrontHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full flex flex-col items-center bg-white sticky top-0 z-50 shadow-[0_1px_0_0_#e5e7eb]">
      {/* ─── Announcement Banner ─── */}
      {showBanner && (
        <div className="w-full bg-black text-white py-2.5 px-4 flex items-center justify-center gap-4 text-xs sm:text-sm font-medium relative">
          <span className="text-center leading-snug">
            Sign up and get 20% off to your first order.{' '}
            <Link
              href="/register"
              className="underline font-semibold hover:opacity-80 transition-opacity"
            >
              Sign Up Now
            </Link>
          </span>
          <button
            onClick={() => setShowBanner(false)}
            aria-label="Close announcement"
            className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Main Navigation ─── */}
      <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-20 py-3 flex items-center justify-between gap-4">
        {/* Hamburger – mobile only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-0.5 bg-black transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-black transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-black transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {/* Brand Logo */}
        <Link
          href="/"
          className="text-xl sm:text-2xl font-extrabold text-black shrink-0 tracking-tight"
          style={{ fontFamily: "'Integral CF', 'Inter', sans-serif" }}
        >
          SHOP.CO
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-800">
          <div className="relative group">
            <button
              onMouseEnter={() => setShowShopMenu(true)}
              onMouseLeave={() => setShowShopMenu(false)}
              className="flex items-center gap-1 hover:text-black transition-colors py-1"
            >
              Shop <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {showShopMenu && (
              <div
                onMouseEnter={() => setShowShopMenu(true)}
                onMouseLeave={() => setShowShopMenu(false)}
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in"
              >
                {['Casual', 'Formal', 'Party', 'Gym'].map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${cat}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/shop?isOnSale=true" className="hover:text-black transition-colors">
            On Sale
          </Link>
          <Link href="/shop?sort=newest" className="hover:text-black transition-colors">
            New Arrivals
          </Link>
          <Link href="/shop" className="hover:text-black transition-colors">
            Brands
          </Link>
        </nav>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-[480px] hidden sm:block"
        >
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f0f0f0] rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all placeholder:text-gray-400"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            {totalCartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {totalCartCount > 9 ? '9+' : totalCartCount}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between border-b pb-3 mb-3">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="w-4 h-4 text-gray-400 hover:text-black" />
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto flex flex-col gap-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No recent notifications</p>
                  ) : (
                    notifications.map((n: any) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-amber-50 border-amber-200 font-semibold'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900">{n.title}</span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm hover:bg-gray-800 transition-colors"
                aria-label="User menu"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-fade-in">
                  <div className="border-b pb-3 mb-2">
                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {user.loyaltyPoints !== undefined && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit font-semibold">
                        <Award className="w-3 h-3" /> {user.loyaltyPoints} pts
                      </div>
                    )}
                  </div>
                  <Link
                    href="/orders"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                  >
                    My Orders
                  </Link>
                  {(user.role === 'Admin' || user.role === 'Super Admin') && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors text-gray-700"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { dispatch(logout()); setShowUserDropdown(false); router.push('/login'); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-xl transition-colors w-full mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Sign in"
            >
              <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            </Link>
          )}
        </div>
      </div>

      {/* ─── Mobile slide-down menu ─── */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 animate-slide-up">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f0f0f0] rounded-full py-2.5 pl-9 pr-4 text-sm outline-none"
            />
          </form>
          <nav className="flex flex-col gap-1">
            {[
              { href: '/shop', label: 'Shop' },
              { href: '/shop?isOnSale=true', label: 'On Sale' },
              { href: '/shop?sort=newest', label: 'New Arrivals' },
              { href: '/shop', label: 'Brands' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-full text-center"
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
