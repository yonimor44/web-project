import api from './api';

export interface CreateOrderDto {
    shippingAddress: string;
    city: string;
    phone: string;
}

export const ordersService = {
    // 1. יצירת הזמנה חדשה - מקבלת גם רשימת IDs אופציונלית
    create: async (orderData: CreateOrderDto, selectedItemIds?: number[]) => {
        const response = await api.post('/orders', {
            ...orderData,
            selectedItemIds // שולחים את זה לשרת
        });
        return response.data;
    },

    // 2. קבלת ההזמנות שלי
    getMyOrders: async () => {
        const response = await api.get('/orders'); 
        return response.data;
    },

    // 3. קבלת כל ההזמנות (אדמין)
    getAllOrders: async () => {
        const response = await api.get('/orders/all');
        return response.data;
    },

    // עדכון סטטוס
    updateStatus: async (orderId: number, status: string) => {
        const response = await api.patch(`/orders/${orderId}/status`, { status });
        return response.data;
    }
};