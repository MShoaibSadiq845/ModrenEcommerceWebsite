'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// Configure NProgress — thin bar at top, no spinner
NProgress.configure({ showSpinner: false, trickleSpeed: 200, minimum: 0.08 });

function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  useEffect(() => {
    NProgress.start();
    return () => { NProgress.done(); };
  }, [pathname, searchParams]);

  return null;
}

export function RouteLoader() {
  return (
    <Suspense fallback={null}>
      <RouteProgress />
    </Suspense>
  );
}
