'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface Props {
  children: React.ReactNode;
  /** Where to send unauthenticated users. Defaults to /login */
  redirectTo?: string;
}

/**
 * Wraps any page/layout that requires authentication.
 * - Renders nothing until the client has mounted (avoids SSR hydration mismatch)
 * - Redirects unauthenticated users to `redirectTo` (default: /login)
 * - Passes `?from=<current-path>` so the login page can redirect back after sign-in
 */
export function ProtectedRoute({ children, redirectTo = '/login' }: Props) {
  const router = useRouter();
  const { isAuthenticated } = useSelector((s: RootState) => s.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      const currentPath =
        typeof window !== 'undefined' ? window.location.pathname : '';
      const target = currentPath
        ? `${redirectTo}?from=${encodeURIComponent(currentPath)}`
        : redirectTo;
      router.replace(target);
    }
  }, [mounted, isAuthenticated, redirectTo, router]);

  // 1. Not yet mounted — render nothing (avoids flash)
  if (!mounted) return null;

  // 2. Not authenticated — render nothing while redirect fires
  if (!isAuthenticated) return null;

  // 3. Authenticated — render children
  return <>{children}</>;
}
