import api from './api';
import type { User } from '../types/auth.types';

export const usersService = {
  getAllUsers: async () => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  updateRole: async (userId: number, role: string) => {
        const response = await api.patch(`/users/${userId}/role`, { role });
        return response.data;
    }
};