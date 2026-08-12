'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminTopbar } from '@/components/admin/Topbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.role !== 'Admin' && user.role !== 'Super Admin') {
      router.push('/shop');
    }
  }, [mounted, isAuthenticated, user, router]);

  // Render nothing until mounted — prevents SSR/client hydration mismatch
  // because localStorage-based auth state is only available on the client
  if (!mounted || !isAuthenticated || (user?.role !== 'Admin' && user?.role !== 'Super Admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-['Rubik'] text-black">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
