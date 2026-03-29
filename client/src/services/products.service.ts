// שירות לניהול מוצרים.
// כולל לוגיקה מורכבת של סינון (Filters), חיפוש וניהול מוצרים (CRUD) לאדמין.

import api from './api';
import type { Product } from '../types/product.types';

// טיפוס לקלט של יצירת/עדכון מוצר
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

// טיפוס לפילטרים של החיפוש
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
    // שליפת מוצרים עם אפשרויות סינון מתקדמות
    getAll: async (filters: ProductFilters = {}) => {
        const params = new URLSearchParams();
        
        // בניית ה-Query String דינמית לפי הפילטרים שנבחרו
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

    // שליפת מוצר בודד
    getOne: async (id: string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    // מחיקת מוצר (Admin)
    deleteProduct: async (id: number) => {
        await api.delete(`/products/${id}`);
    },

    // יצירת מוצר (Admin) - תומך ב-FormData להעלאת קבצים
    createProduct: async (productData: ProductInput | FormData) => {
        const isFormData = productData instanceof FormData;
        
        const response = await api.post<Product>('/products', productData, {
            // אם זה FormData, הדפדפן צריך לקבוע את ה-Content-Type
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
        return response.data;
    },

    // עדכון מוצר (Admin) - תומך בעדכון חלקי ובהעלאת קבצים
    updateProduct: async (id: number, productData: Partial<ProductInput> | FormData) => {
        const isFormData = productData instanceof FormData;

        const response = await api.patch<Product>(`/products/${id}`, productData, {
            headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
        });
        return response.data;
    }
};