// שירות לניהול ההרשמה והכניסה למערכת.
// מטפל בתקשורת מול ה-Endpoints של /auth בשרת.

import api from './api';

export const authService = {
    // התחברות למערכת (Login)
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data; // מחזיר { access_token, user }
    },

    // הרשמה למערכת (Register)
    register: async (firstName: string, lastName: string, email: string, password: string) => {
        const response = await api.post('/auth/register', { firstName, lastName, email, password });
        return response.data;
    },

    // קבלת פרטי המשתמש הנוכחי (לפי הטוקן השמור)
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    }
};