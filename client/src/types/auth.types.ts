
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  role: 'admin' | 'user'; // האדמין יוכל לשנות מלאי
  provider?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}