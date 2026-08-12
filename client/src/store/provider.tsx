'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, RootState } from './store';
import { SocketListener } from '@/components/SocketListener';
import { logout } from './slices/authSlice';

const AUTH_VERSION = 'v2'; // bump this whenever JWT secret changes
const AUTH_VERSION_KEY = 'auth_version';

/**
 * On mount, verify the stored auth version matches the current version.
 * If not (e.g. JWT secret rotated), clear stale credentials and force re-login.
 * Also validates the token looks like a real JWT (3 base64 segments).
 */
function AuthVersionGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const token = useSelector((s: RootState) => s.auth.token);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedVersion = localStorage.getItem(AUTH_VERSION_KEY);

    // Wipe credentials if auth version mismatch (secret was rotated)
    if (storedVersion !== AUTH_VERSION) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION);
      dispatch(logout());
      return;
    }

    // Validate the token structure: a valid JWT has exactly 3 dot-separated
    // base64url segments. Reject anything that doesn't match.
    if (token) {
      const parts = token.split('.');
      if (parts.length !== 3) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch(logout());
      }
    }
  }, [dispatch, token]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthVersionGuard>
        <SocketListener />
        {children}
      </AuthVersionGuard>
    </Provider>
  );
}
