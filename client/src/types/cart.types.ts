import type { Product } from './product.types';

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  // בעתיד נוסיף פה גם totalPrice שחושב בשרת
}