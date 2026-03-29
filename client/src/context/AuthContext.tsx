// ניהול המשתמש הגלובלי. מטפל בכל מחזור החיים של האימות:
// בדיקת טוקן בעלייה, התחברות, הרשמה, יציאה ורענון נתונים.

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/auth.types';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth.service';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User | null>;
  loginWithToken: (token: string) => Promise<User | null>; 
  register: (first: string, last: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // משיכת הפרופיל המלא מהשרת.
  // הטוקן מכיל מידע בסיסי בלבד (שם, אימייל, תפקיד).
  // הכתובות והטלפון נמצאים רק בדאטה-בייס, לכן צריך את הקריאה הזו.
  const fetchUserProfile = async () => {
    try {
      const response = await api.get<User>('/users/profile', {
          headers: { 'Cache-Control': 'no-cache' }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user profile', error);
    }
  };

  // פונקציית הליבה של הקונטקסט: עיבוד טוקן JWT
  const handleTokenProcessing = async (token: string): Promise<User | null> => {
    // 1. שמירה בדפדפן והגדרת Header לבקשות הבאות
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
        const decoded: any = jwtDecode(token);
        
        // 2. בדיקת תוקף (Expiration)
        if (decoded.exp < (Date.now() / 1000)) {
            console.log('Token expired');
            logout();
            return null;
        }

        // 3. עדכון מהיר (Optimistic UI) - מציגים מידע מהטוקן מיד
        const userFromToken: User = {
            id: decoded.sub,
            email: decoded.email,
            firstName: decoded.firstName || 'User',
            lastName: decoded.lastName,
            role: decoded.role || 'user', 
            picture: decoded.picture,
            provider: decoded.provider || 'local'
        };
        setUser(userFromToken);

        // 4. עדכון מלא ברקע - משלים פרטים חסרים (כמו כתובת)
        await fetchUserProfile();

        return userFromToken;

    } catch (e) {
        console.error('Token decode failed', e);
        logout();
        return null;
    }
  };

  // בדיקת טוקן בעת טעינת האתר (כדי שהמשתמש יישאר מחובר בריענון)
  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) await handleTokenProcessing(token);
        setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    return handleTokenProcessing(data.access_token);
  };

  const loginWithToken = async (token: string) => {
    return handleTokenProcessing(token);
  };

  const register = async (first: string, last: string, email: string, pass: string) => {
    const data = await authService.register(first, last, email, pass);
    await handleTokenProcessing(data.access_token); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };
  
  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        loading, 
        login, 
        loginWithToken, 
        register, 
        logout, 
        refreshUser: fetchUserProfile 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};