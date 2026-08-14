import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Strip surrounding double-quotes only when BOTH first and last chars are quotes.
 * This handles the case where a token was stored via JSON.stringify (adds "...").
 * Does NOT touch any character inside the token.
 */
const cleanToken = (token?: string | null): string | null => {
  if (!token) return null;
  const t = token.trim();
  if (t.startsWith('"') && t.endsWith('"')) {
    return t.slice(1, -1).trim() || null;
  }
  return t || null;
};

/**
 * A valid JWT has exactly 3 base64url segments separated by dots.
 */
const isValidJwt = (token: string): boolean => token.split('.').length === 3;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      // 1. Try Redux state first (populated on login)
      let token = (getState() as RootState).auth.token;

      // 2. Fallback: read from localStorage (handles page refresh / SSR hydration lag)
      if (!token && typeof window !== 'undefined') {
        token = cleanToken(localStorage.getItem('token'));
      }

      // 3. Final validation — never send a malformed token
      if (token && isValidJwt(token)) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Product', 'Order', 'User', 'Notification', 'Cart', 'Contact'],
  endpoints: () => ({}),
});
