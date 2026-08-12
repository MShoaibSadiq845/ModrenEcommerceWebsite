import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin' | 'Super Admin';
  loyaltyPoints: number;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

/**
 * Strip surrounding double-quotes that JSON.stringify sometimes wraps values in
 * when stored to localStorage (e.g. `"eyJhb..."` instead of `eyJhb...`).
 * The regex only removes quotes when BOTH the first AND last character are quotes.
 */
const cleanToken = (token: string | null): string | null => {
  if (!token) return null;
  const trimmed = token.trim();
  // Only strip if the token is fully wrapped in double-quotes
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim() || null;
  }
  return trimmed || null;
};

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return cleanToken(localStorage.getItem('token'));
  }
  return null;
};

const getInitialUser = (): AuthUser | null => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialState: AuthState = {
  token: getInitialToken(),
  user: getInitialUser(),
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: string }>,
    ) => {
      const token = cleanToken(action.payload.token);
      state.user = action.payload.user;
      state.token = token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        if (token) {
          // Store raw (no JSON.stringify) so we never get double-quoted tokens
          localStorage.setItem('token', token);
        }
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
