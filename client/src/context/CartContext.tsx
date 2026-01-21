import { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types/cart.types';
import { cartService } from '../services/cart.service';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity?: (productId: number, quantity: number) => Promise<void>;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // פונקציה שטוענת את העגלה מהשרת
  const fetchCart = async (showLoading = true) => {
    if (!user) {
        setCart(null);
        return;
    }
    if (showLoading) setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.log('Cart fetch failed');
      if (!cart) setCart(null);
    } finally {
     if (showLoading) setLoading(false);
    }
  };

  // טעינה ראשונית כשהמשתמש מתחבר
  useEffect(() => {
    fetchCart(true);
  }, [user]);

  // --- התיקון הגדול נמצא פה ---
  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
        setSnackbarMessage('יש להתחבר כדי להוסיף לעגלה');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    try {
      // 1. שולחים בקשה לשרת להוסיף פריט
      await cartService.addToCart(productId, quantity);
      
      // 2. במקום להשתמש בתשובה (שהיא רק פריט בודד ושברה לך את האתר),
      // אנחנו מבקשים את העגלה המלאה מחדש!
      await fetchCart(false);
      
      setSnackbarMessage('המוצר נוסף לעגלה בהצלחה! 🛒');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      const errorMsg = error.response?.data?.message || 'שגיאה בהוספה לעגלה';
      setSnackbarMessage(`אופס! ${errorMsg}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
        await cartService.removeFromCart(productId);
        // גם כאן, מרעננים את העגלה כולה
        await fetchCart(false); 
        
        setSnackbarMessage('המוצר הוסר מהעגלה');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    } catch (error) {
        console.error(error);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
        await cartService.updateQuantity(productId, quantity);
        await fetchCart(false); // מרעננים את העגלה מיד
    } catch (error: any) {
        console.error('Failed to update quantity', error);
        setSnackbarMessage(error.response?.data?.message || 'שגיאה בעדכון כמות');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }
};

  // חישוב סך הפריטים
  const totalItems = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, updateQuantity, totalItems }}>
      {children}
      
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={2000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
