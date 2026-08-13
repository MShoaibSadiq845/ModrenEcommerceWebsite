import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  isOnSale?: boolean;
  pointsPrice: number;
  purchaseType: 'regular' | 'loyalty_only' | 'hybrid';
  image: string;
  quantity: number;
  paymentMethod: 'currency' | 'points';
  size?: string;
  color?: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPercentage: number;
}

const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

const initialState: CartState = {
  items: loadCartFromStorage(),
  promoCode: null,
  discountPercentage: 0,
};

const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.paymentMethod === action.payload.paymentMethod &&
          item.size === action.payload.size &&
          item.color === action.payload.color,
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartToStorage(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ index: number; quantity: number }>,
    ) => {
      const item = state.items[action.payload.index];
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        saveCartToStorage(state.items);
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((_, idx) => idx !== action.payload);
      saveCartToStorage(state.items);
    },
    // Accepts { code, discountPercentage } from the DB validation result
    applyPromoCode: (
      state,
      action: PayloadAction<{ code: string; discountPercentage: number }>,
    ) => {
      state.promoCode = action.payload.code.toUpperCase();
      state.discountPercentage = action.payload.discountPercentage;
    },
    removePromoCode: (state) => {
      state.promoCode = null;
      state.discountPercentage = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = null;
      state.discountPercentage = 0;
      saveCartToStorage([]);
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  applyPromoCode,
  removePromoCode,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
