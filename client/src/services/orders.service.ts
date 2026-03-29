// שירות לניהול הזמנות.
// מאפשר יצירת הזמנה חדשה (Checkout) וצפייה בהיסטוריית ההזמנות.

import api from './api';

// מבנה הנתונים הנדרש ליצירת הזמנה
export interface CreateOrderDto {
    shippingAddress: string;
    city: string;
    phone: string;
    selectedItemIds?: number[]; // אופציונלי: להזמנת חלק מהפריטים בעגלה
}

export const ordersService = {
    // יצירת הזמנה חדשה
    create: async (orderData: CreateOrderDto) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    // קבלת ההיסטוריה האישית (My Orders)
    getMyOrders: async () => {
        const response = await api.get('/orders'); 
        return response.data;
    },

    // קבלת כל ההזמנות במערכת (Admin Only)
    getAllOrders: async () => {
        const response = await api.get('/orders/all');
        return response.data;
    },

    // עדכון סטטוס הזמנה (Admin Only)
    updateStatus: async (orderId: number, status: string) => {
        const response = await api.patch(`/orders/${orderId}/status`, { status });
        return response.data;
    }
};