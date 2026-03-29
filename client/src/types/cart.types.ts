// הגדרות הטיפוסים של עגלת הקניות.
// משמש את הקומפוננטות שמציגות את העגלה ואת הסרוויס שמנהל אותה.

import type { Product } from './product.types';

// פריט בודד בתוך העגלה
export interface CartItem {
    id: number;
    quantity: number;
    product: Product; // אובייקט המוצר המלא (כולל שם, מחיר, תמונה וכו')
}

// מבנה העגלה המלאה
export interface Cart {
    id: number;
    items: CartItem[];
}