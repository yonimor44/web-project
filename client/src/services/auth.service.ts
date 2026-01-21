import api from './api';

export const authService = {
  // התחברות עם מייל וסיסמה
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // השרת מחזיר access_token
  },

  // הרשמה למערכת
  register: async (firstName: string, lastName: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password });
    return response.data;
  },

  // פונקציה לקבלת פרטי המשתמש הנוכחי (לפי הטוקן)
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  }
};