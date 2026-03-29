// קובץ זה מגדיר את מבנה הנתונים של המשתמש והתשובות הקשורות לאימות (Auth).
// משמש בכל מקום שבו אנחנו צריכים לדעת איזה שדות יש למשתמש.

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    picture?: string;
    provider: string; // 'local' או 'google'
    
    // שדות כתובת ברירת מחדל (אופציונליים)
    defaultAddress?: string;
    defaultCity?: string;
    defaultPhone?: string;
}

// התשובה שהשרת מחזיר אחרי התחברות מוצלחת
export interface LoginResponse {
    user: User;           // פרטי המשתמש
    access_token: string; // הטוקן שישמש לבקשות הבאות
}