'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminTopbar } from '@/components/admin/Topbar';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) router.push('/login');
    else if (user && user.role !== 'Admin' && user.role !== 'Super Admin') router.push('/shop');
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-['Rubik'] text-black">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 transition-transform duration-300
        lg:static lg:translate-x-0 lg:flex lg:shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Mobile topbar row with hamburger */}
        <div className="flex items-center lg:hidden bg-white border-b border-gray-200 px-4 py-3 gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <span className="font-bold text-base text-gray-900 font-['Integral_CF']">SHOP.CO Admin</span>
        </div>

        <AdminTopbar />
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
