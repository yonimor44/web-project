import { createContext, useContext, useState, useEffect } from 'react';
import type { Cart } from '../types/cart.types';
import type { Product } from '../types/product.types'; // <--- וודא שיש לך את הייבוא הזה
import { cartService } from '../services/cart.service';
import { Snackbar, Alert } from '@mui/material';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  // שינינו את החתימה: מקבלים מוצר שלם במקום רק ID
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalItems: number;
  total: number;
  
  // ניהול ה-Drawer (עגלה צדדית)
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;

  // --- חדש: ניהול המודל הקופץ (Add to Cart Modal) ---
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (isOpen: boolean) => void;
  lastAddedItem: Product | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  
  // State לפתיחת ה-Drawer (עגלה צדדית)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- State חדש למודל ההוספה ---
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Product | null>(null);

  // Snackbar State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const fetchCart = async (showLoading = true) => {
    if (!user) { setCart(null); return; }
    if (showLoading) setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (error) {
      console.log('Cart fetch failed (probably empty)');
      if (!cart) setCart(null);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { fetchCart(true); }, [user]);

  // --- הפונקציה המעודכנת ---
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
        setSnackbarMessage('יש להתחבר כדי להוסיף לעגלה');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }

    try {
      // שולחים לשרת את ה-ID
      await cartService.addToCart(product.id, quantity);
      await fetchCart(false);
      
      // במקום לפתוח סנאקבר או את ה-Drawer, אנחנו מעדכנים את המודל החדש
      setLastAddedItem(product); // שומרים את המוצר האחרון שנוסף
      setIsSuccessModalOpen(true); // פותחים את החלון הקופץ
      
      // הערה: מחקנו את setIsCartOpen(true) כדי שהעגלה הצדדית לא תיפתח
      
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
        await fetchCart(false); 
        
        setSnackbarMessage('המוצר הוסר מהעגלה');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
    } catch (error) { console.error(error); }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    try {
        await cartService.updateQuantity(productId, quantity);
        await fetchCart(false);
    } catch (error: any) {
        console.error('Failed to update quantity', error);
        setSnackbarMessage(error.response?.data?.message || 'שגיאה בעדכון כמות');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }
  };

  const clearCart = () => {
      setCart(null);
  };

  const totalItems = (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
  const total = (cart?.items || []).reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
        cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, 
        totalItems, total,
        isCartOpen, setIsCartOpen,
        isSuccessModalOpen, setIsSuccessModalOpen, lastAddedItem // חשיפה החוצה
    }}>
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
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};