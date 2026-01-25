import api from './api';

export interface CreateOrderDto {
  shippingAddress: string;
  city: string;
  phone: string;
}

export const ordersService = {
  // יצירת הזמנה חדשה
  create: async (orderData: CreateOrderDto) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // קבלת כל ההזמנות שלי (היסטוריה)
  getMyOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  }
};