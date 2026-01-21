import api from './api';
import type { Product } from '../types/product.types';

export const productsService = {
  // שליפת כל המוצרים
  getAll: async () => {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  // שליפת מוצר בודד (נשתמש בזה בהמשך לדף פרטים)
  getOne: async (id: number) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  }
};