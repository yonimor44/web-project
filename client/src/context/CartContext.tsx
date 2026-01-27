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
  fetchCart: (showLoading?: boolean) => Promise<void>; // הוספנו חשיפה של fetchCart
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Product | null>(null);
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
      // אם העגלה ריקה או לא קיימת, נאפס את הסטייט
      setCart(null); 
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => { fetchCart(true); }, [user]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) {
        setSnackbarMessage('יש להתחבר כדי להוסיף לעגלה');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
    }
    try {
      await cartService.addToCart(product.id, quantity);
      await fetchCart(false);
      setLastAddedItem(product);
      setIsSuccessModalOpen(true);
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
        setSnackbarMessage(error.response?.data?.message || 'שגיאה בעדכון כמות');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
    }
  };

  // פונקציה לניקוי מקומי מיידי
  const clearCart = () => {
      setCart(null);
  };

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
        open={snackbarOpen} autoHideDuration={2000} onClose={() => setSnackbarOpen(false)}
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