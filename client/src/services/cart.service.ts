import api from './api';
import type { Cart } from '../types/cart.types';

export const cartService = {
  // שליפת העגלה שלי
  getCart: async () => {
    const response = await api.get<Cart>('/cart');
    return response.data;
  },

  // הוספת פריט (כמות ברירת מחדל = 1)
  addToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post<Cart>('/cart/items', { productId, quantity });
    return response.data;
  },

  // הסרת פריט
  removeFromCart: async (productId: number) => {
    const response = await api.delete<Cart>(`/cart/items/${productId}`);
    return response.data;
  },
  
  // עדכון כמות פריט  
  updateQuantity: async (productId: number, quantity: number) => {
    const response = await api.post('/cart/update-quantity', { productId, quantity });
    return response.data;
  },

  // ריקון עגלה (נשתמש אחרי תשלום)
  clearCart: async () => {
    await api.delete('/cart');
  }
};