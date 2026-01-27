export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    picture?: string;
    provider: string;
    
    // --- הוספנו את השדות החדשים כאופציונליים (?) ---
    defaultAddress?: string;
    defaultCity?: string;
    defaultPhone?: string;
}

export interface LoginResponse {
    user: User;
    access_token: string;
}