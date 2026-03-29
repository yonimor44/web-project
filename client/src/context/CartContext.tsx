// ניהול עגלת הקניות: סנכרון מול השרת, חישוב סכומים בזמן אמת,
// וניהול רכיבי ה-UI הקשורים (מגירה, הודעות הצלחה/שגיאה).

import { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types/cart.types';
import type { Product } from '../types/product.types'; 
import { cartService } from '../services/cart.service';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  fetchCart: (showLoading?: boolean) => Promise<void>;
  totalItems: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (isOpen: boolean) => void;
  lastAddedItem: Product | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  
  // ניהול מצבי תצוגה (UI)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Product | null>(null);
  
  // ניהול הודעות למשתמש (Snackbars)
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // פונקציה לסנכרון העגלה מהשרת
  const fetchCart = async (showLoading = true) => {
    if (!user) { setCart(null); return; }
    if (showLoading) setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      // אם אין עגלה (למשל משתמש חדש לגמרי) או שגיאה, נאפס ל-null
      setCart(null); 
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // משיכת העגלה בכל פעם שהמשתמש משתנה (לוגין/לוגאוט)
  useEffect(() => { fetchCart(true); }, [user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
        showSnackbar('יש להתחבר כדי להוסיף לעגלה', 'error');
        return;
    }
    try {
      await cartService.addToCart(product.id, quantity);
      await fetchCart(false); // עדכון שקט של העגלה בלי לואדר
      
      // עדכון הסטייט להצגת מודל הצלחה
      setLastAddedItem(product);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      const errorMsg = error.response?.data?.message || 'שגיאה בהוספה לעגלה';
      showSnackbar(`אופס! ${errorMsg}`, 'error');
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
        await cartService.removeFromCart(productId);
        await fetchCart(false); 
        showSnackbar('המוצר הוסר מהעגלה', 'success');
    } catch (error) { console.error(error); }
  };
  
  const updateQuantity = async (productId: number, quantity: number) => {
    try {
        await cartService.updateQuantity(productId, quantity);
        await fetchCart(false);
    } catch (error: any) {
        showSnackbar(error.response?.data?.message || 'שגיאה בעדכון כמות', 'error');
    }
  };

  const clearCart = () => setCart(null);

  const showSnackbar = (msg: string, severity: 'success' | 'error') => {
      setSnackbarMessage(msg);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
  };

  // חישובים נגזרים (Derived State):
  // חישוב סה"כ פריטים ומחיר בכל רינדור, כדי להבטיח סנכרון מלא עם ה-Items
  const totalItems = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const total = (cart?.items || []).reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
        cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart, 
        totalItems, total,
        isCartOpen, setIsCartOpen,
        isSuccessModalOpen, setIsSuccessModalOpen, lastAddedItem 
    }}>
      {children}
      <Snackbar 
        open={snackbarOpen} autoHideDuration={2500} onClose={() => setSnackbarOpen(false)}
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
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};