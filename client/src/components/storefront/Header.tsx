'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { useGetNotificationsQuery, useMarkAsReadMutation } from '@/store/services/notificationsApi';
import { ProfileDrawer } from '@/components/ProfileDrawer';
import {
  ShoppingCart, User as UserIcon, LogOut, Award,
  Search, X, ChevronDown, Bell, UserCog,
} from 'lucide-react';

export function StorefrontHeader() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const cartItems = useSelector((s: RootState) => s.cart.items);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const [searchQuery, setSearchQuery] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [showShopMenu, setShowShopMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, { pollingInterval: 30000 });
  const [markAsRead] = useMarkAsReadMutation();
  const unreadCount = (notifications as any[]).filter((n) => !n.isRead).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const avatarUrl = (user as any)?.avatar || '';

  return (
    <>
      <header className="w-full flex flex-col items-center bg-white sticky top-0 z-50 shadow-[0_1px_0_0_#e5e7eb]">
        {/* ─── Announcement banner ─── */}
        {showBanner && (
          <div className="w-full bg-black text-white py-2.5 px-4 flex items-center justify-center gap-4 text-xs sm:text-sm font-medium relative">
            <span className="text-center leading-snug">
              Sign up and get 20% off to your first order.{' '}
              <Link href="/register" className="underline font-semibold hover:opacity-80 transition-opacity">Sign Up Now</Link>
            </span>
            <button onClick={() => setShowBanner(false)} className="absolute right-4 p-1 hover:bg-white/10 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── Main nav ─── */}
        <div className="w-full max-w-[1440px] px-4 sm:px-6 lg:px-20 py-3 flex items-center justify-between gap-4">
          {/* Hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden flex flex-col gap-1.5 p-2">
            <span className={`block w-6 h-0.5 bg-black transition-transform duration-200 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-black transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-black transition-transform duration-200 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>

          {/* Brand */}
          <Link href="/" className="text-xl sm:text-2xl font-extrabold text-black shrink-0 tracking-tight"
            style={{ fontFamily: "'Integral CF','Inter',sans-serif" }}>
            SHOP.CO
          </Link>

          {/* Desktop nav */}
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
                  {['Casual','Formal','Party','Gym'].map((cat) => (
                    <Link key={cat} href={`/shop?category=${cat}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                      {cat}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/shop?isOnSale=true" className="hover:text-black transition-colors">On Sale</Link>
            <Link href="/shop?sort=newest" className="hover:text-black transition-colors">New Arrivals</Link>
            <Link href="/shop" className="hover:text-black transition-colors">Brands</Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[480px] hidden sm:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f0f0f0] rounded-full py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-black/20 transition-all"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile search */}
            <button onClick={() => setMobileMenuOpen(true)} className="sm:hidden p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              {totalCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalCartCount > 9 ? '9+' : totalCartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
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
                    {(notifications as any[]).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No recent notifications</p>
                    ) : (
                      (notifications as any[]).map((n) => (
                        <div key={n._id} onClick={() => markAsRead(n._id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead ? 'bg-gray-50 border-gray-100' : 'bg-amber-50 border-amber-200 font-semibold'
                          }`}>
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
                {/* Avatar button */}
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-8 h-8 rounded-full overflow-hidden bg-black text-white flex items-center justify-center font-bold text-sm hover:ring-2 hover:ring-black/20 transition-all"
                >
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="avatar" width={32} height={32} className="object-cover w-full h-full" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-fade-in">
                    {/* User info */}
                    <div className="flex items-center gap-3 pb-3 mb-2 border-b border-gray-100">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {avatarUrl
                          ? <Image src={avatarUrl} alt="" width={40} height={40} className="object-cover w-full h-full" />
                          : user.name.charAt(0).toUpperCase()
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {user.loyaltyPoints !== undefined && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                            <Award className="w-2.5 h-2.5" /> {user.loyaltyPoints} pts
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Edit Profile — opens drawer ── */}
                    <button
                      onClick={() => { setShowUserDropdown(false); setProfileOpen(true); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors text-gray-700 font-medium"
                    >
                      <UserCog className="w-4 h-4" /> Edit Profile
                    </button>

                    <Link href="/orders" onClick={() => setShowUserDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors text-gray-700">
                      My Orders
                    </Link>

                    {(user.role === 'Admin' || user.role === 'Super Admin') && (
                      <Link href="/admin" onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-xl transition-colors text-gray-700">
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={() => { dispatch(logout()); setShowUserDropdown(false); router.push('/login'); }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 rounded-xl transition-colors w-full mt-1 font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden sm:flex p-2 hover:bg-gray-100 rounded-full transition-colors">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </Link>
            )}
          </div>
        </div>

        {/* ─── Mobile menu ─── */}
        {mobileMenuOpen && (
          <div className="lg:hidden w-full border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4 animate-slide-up">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search for products..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f0f0f0] rounded-full py-2.5 pl-9 pr-4 text-sm outline-none" />
            </form>
            <nav className="flex flex-col gap-1">
              {[{ href: '/shop', label: 'Shop' }, { href: '/shop?isOnSale=true', label: 'On Sale' },
                { href: '/shop?sort=newest', label: 'New Arrivals' }, { href: '/shop', label: 'Brands' }]
                .map(({ href, label }) => (
                  <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-xl">
                    {label}
                  </Link>
                ))}
              {isAuthenticated && (
                <button onClick={() => { setMobileMenuOpen(false); setProfileOpen(true); }}
                  className="text-left px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 rounded-xl">
                  Edit Profile
                </button>
              )}
              {!isAuthenticated && (
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-full text-center">
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ─── Profile drawer (outside header so it's above everything) ─── */}
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
