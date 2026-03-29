// רכיב מעטפת (Wrapper) להגנה על נתיבים.
// מוודא שהמשתמש מחובר + בעל הרשאת Admin.

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    children: ReactNode;
}

export const AdminGuard = ({ children }: Props) => {
    const { user, isAuthenticated } = useAuth();
    
    // 1. בדיקת התחברות בסיסית
    if (!isAuthenticated && !user) {
         return <Navigate to="/login" replace />;
    }

    // 2. בדיקת הרשאת ניהול
    if (user && user.role !== 'admin') {
        alert('אין לך הרשאות גישה לדף זה! ⛔');
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};