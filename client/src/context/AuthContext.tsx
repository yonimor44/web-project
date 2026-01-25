import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/auth.types';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../services/auth.service';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithToken: (token: string) => void; 
  register: (first: string, last: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- הפונקציה המרכזית שמפענחת טוקן ומעדכנת את המשתמש ---
  const handleTokenProcessing = (token: string) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
        const decoded: any = jwtDecode(token);
        
        // בדיקת תוקף
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.log('Token expired');
            logout();
            return;
        }

        setUser({
            id: decoded.sub,
            email: decoded.email,
            firstName: decoded.firstName || 'User',
            lastName: decoded.lastName,
            // --- התיקון כאן: ---
            // במקום decoded.roles?.[0], אנחנו קוראים את מה שהשרת שלח: decoded.role
            role: decoded.role || 'user', 
            // -------------------
            picture: decoded.picture,
        });
    } catch (e) {
        console.error('Failed to decode token', e);
        logout();
    }
  };

  // בדיקה בטעינה הראשונית של האפליקציה
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        handleTokenProcessing(token);
    }
    setLoading(false);
  }, []);

  // --- 1. לוגין רגיל (טופס) ---
  const login = async (email: string, pass: string) => {
    const data = await authService.login(email, pass);
    handleTokenProcessing(data.access_token);
  };

  // --- 2. לוגין ישיר עם טוקן (גוגל) ---
  const loginWithToken = (token: string) => {
    handleTokenProcessing(token);
  };

  // --- 3. הרשמה ---
  const register = async (first: string, last: string, email: string, pass: string) => {
    const data = await authService.register(first, last, email, pass);
    handleTokenProcessing(data.access_token); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, loginWithToken, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};