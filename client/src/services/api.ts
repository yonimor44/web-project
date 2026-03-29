// קובץ ההגדרות הראשי של Axios.
// כאן אנחנו מגדירים את כתובת השרת, ומוסיפים Interceptors
// שדואגים להוסיף את הטוקן לכל בקשה באופן אוטומטי.

import axios from 'axios';

// שימוש במשתנה סביבה (VITE_API_URL) או ברירת מחדל ללוקאל
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: הוספת הטוקן לכל בקשה יוצאת
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;