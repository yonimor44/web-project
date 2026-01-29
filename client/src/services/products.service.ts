import api from './api';
import type { Product } from '../types/product.types';

export interface ProductInput {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    brand: string;
    carMake: string;
    scale: string;
    color: string;
}

export interface ProductFilters {
    search?: string;
    category?: string;
    brand?: string;
    carMake?: string;
    scale?: string;
    sort?: string;
    maxPrice?: number;
}

export const productsService = {
  getAll: async (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.brand && filters.brand !== 'All') params.append('brand', filters.brand);
    if (filters.carMake && filters.carMake !== 'All') params.append('carMake', filters.carMake);
    if (filters.scale && filters.scale !== 'All') params.append('scale', filters.scale);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.maxPrice && filters.maxPrice > 0) params.append('maxPrice', filters.maxPrice.toString());

    const response = await api.get<Product[]>(`/products?${params.toString()}`);
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  deleteProduct: async (id: number) => {
    await api.delete(`/products/${id}`);
  },

  // --- תיקון: תמיכה ב-FormData ---
  createProduct: async (productData: ProductInput | FormData) => {
      const isFormData = productData instanceof FormData;
      
      const response = await api.post<Product>('/products', productData, {
          headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return response.data;
  },

  // --- תיקון: תמיכה ב-FormData ---
  updateProduct: async (id: number, productData: Partial<ProductInput> | FormData) => {
      const isFormData = productData instanceof FormData;

      const response = await api.patch<Product>(`/products/${id}`, productData, {
          headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return response.data;
  }
};