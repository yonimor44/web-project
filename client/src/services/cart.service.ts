// שירות לניהול עגלת הקניות בצד הלקוח.
// מאפשר שליפה, הוספה, הסרה ועדכון כמויות מול השרת.

import api from './api';
import type { Cart } from '../types/cart.types';

export const cartService = {
    // שליפת העגלה של המשתמש המחובר
    getCart: async () => {
        const response = await api.get<Cart>('/cart');
        return response.data;
    },

    // הוספת פריט לעגלה (ברירת מחדל כמות = 1)
    addToCart: async (productId: number, quantity: number = 1) => {
        const response = await api.post<Cart>('/cart/items', { productId, quantity });
        return response.data;
    },

    // הסרת פריט מהעגלה
    removeFromCart: async (productId: number) => {
        const response = await api.delete<Cart>(`/cart/items/${productId}`);
        return response.data;
    },
    
    // עדכון כמות של פריט קיים
    updateQuantity: async (productId: number, quantity: number) => {
        const response = await api.post('/cart/update-quantity', { productId, quantity });
        return response.data;
    },

    // ריקון מלא של העגלה (למשל אחרי רכישה מוצלחת)
    clearCart: async () => {
        await api.delete('/cart');
    }
};