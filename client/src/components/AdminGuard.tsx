import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    children: ReactNode;
}

export const AdminGuard = ({ children }: Props) => {
    const { user, isAuthenticated } = useAuth();


    // --- הוסף את השורות האלו ---
    console.log('ADMIN GUARD CHECK:');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User Object:', user);
    console.log('User Role:', user?.role);
    // ---------------------------
    
    // 1. בדיקה: האם המשתמש מחובר?
    if (!isAuthenticated && !user) {
         return <Navigate to="/login" replace />;
    }

    // 2. בדיקה: האם המשתמש הוא אדמין?
    // שים לב: זה מסתמך על כך שהוספנו role לנתונים שחוזרים מהשרת ב-AuthService
    if (user && user.role !== 'admin') {
        alert('אין לך הרשאות גישה לדף זה! ⛔');
        return <Navigate to="/" replace />;
    }

    // 3. הכל תקין - כנס
    return <>{children}</>;
};