// שירות לניהול משתמשים.
// מאפשר למשתמש רגיל לעדכן את הפרופיל שלו, ולאדמין לנהל משתמשים אחרים.

import api from './api';
import type { User } from '../types/auth.types';

export const usersService = {
    // שליפת כל המשתמשים (Admin Only)
    getAllUsers: async () => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },

    // שינוי תפקיד משתמש (Admin Only)
    updateRole: async (userId: number, role: string) => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data;
    },

    // עדכון פרופיל אישי (שם, כתובת, טלפון)
    updateProfile: async (data: Partial<User>) => {
        const response = await api.put<User>('/users/profile', data);
        return response.data;
    },

    // שינוי סיסמה
    changePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await api.post('/users/change-password', data);
        return response.data;
    }
};