import api from './api';

// מעדכנים את ה-Interface שיתאים בול למה שהשרת מצפה לקבל
export interface CreateOrderDto {
    shippingAddress: string;
    city: string;
    phone: string;
    selectedItemIds?: number[]; // הוספנו את זה כאן
}

export const ordersService = {
    // 1. יצירת הזמנה חדשה
    // שינינו את זה לקבל ארגומנט אחד שכולל את הכל (הכתובת + הפריטים)
    create: async (orderData: CreateOrderDto) => {
        const response = await api.post('/orders', orderData);
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