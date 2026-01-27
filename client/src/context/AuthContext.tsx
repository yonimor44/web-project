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
  refreshUser: () => Promise<void>; // --- הוספנו את זה ---
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- פונקציה חדשה: מביאה את המידע הכי טרי מהדאטה-בייס ---
  const fetchUserProfile = async () => {
    try {
      // מוסיפים headers כדי למנוע cache
      const response = await api.get<User>('/users/profile', {
          headers: { 'Cache-Control': 'no-cache' }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user profile', error);
    }
  };

  const handleTokenProcessing = async (token: string): Promise<User | null> => {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            console.log('Token expired');
            logout();
            return null;
        }

        // שלב 1: מציגים מיד את המידע מהטוקן (כדי שהממשק יעלה מהר)
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

        // שלב 2: מושכים ברקע את המידע המלא (כולל כתובות) מהשרת
        // זה מה שמתקן את הבאג שהכתובת נעלמת!
        await fetchUserProfile();

        return userFromToken;

    } catch (e) {
        console.error('Failed to decode token', e);
        logout();
        return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            await handleTokenProcessing(token);
        }
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

  // פונקציה חשופה לרענון יזום (למשל אחרי שמירת פרופיל)
  const refreshUser = async () => {
      await fetchUserProfile();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, loginWithToken, register, logout, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};