import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity'; // <--- ייבוא של המוצר
import { User } from 'src/users/entities/user.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product) // <--- הזרקת הטבלה של המוצרים
    private productsRepository: Repository<Product>,
  ) {}

  // יצירת עגלה למשתמש חדש
  async createForUser(user: User) {
    const newCart = this.cartRepository.create({ user });
    return this.cartRepository.save(newCart);
  }

  // שליפת עגלה כולל הפריטים שבתוכה
  async findCartByUserId(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'], 
    });
    
    if (!cart) {
      // במקרה נדיר שאין עגלה (אמור להיווצר בהרשמה), ניצור אחת
      // אבל לבינתיים נזרוק שגיאה
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }

  // --- הפונקציה המעודכנת והחכמה: הוספה לעגלה ---
  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { productId, quantity } = addToCartDto;

    // 1. קודם כל - בודקים שהמוצר קיים ושיש מספיק מלאי!
    const product = await this.productsRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException(`Not enough stock. Only ${product.stock} units left.`);
    }

    // 2. מביאים את העגלה של המשתמש
    const cart = await this.findCartByUserId(userId);

    // 3. בודקים אם המוצר כבר קיים בעגלה הזאת
    const existingItem = cart.items.find((item) => item.product.id === productId);

    if (existingItem) {
      // בדיקה נוספת: האם הכמות החדשה תחרוג מהמלאי?
      if (existingItem.quantity + quantity > product.stock) {
         throw new BadRequestException(`Cannot add more items. You reached the stock limit.`);
      }

      // אם קיים - רק מוסיפים לכמות
      existingItem.quantity += quantity;
      return this.cartItemRepository.save(existingItem);
    } else {
      // אם לא קיים - יוצרים שורה חדשה בטבלה
      const newItem = this.cartItemRepository.create({
        cart: cart,      // שיוך לעגלה שמצאנו
        product: product, // שיוך למוצר שמצאנו (חשוב להעביר את האובייקט המלא)
        quantity: quantity,
      });
      return this.cartItemRepository.save(newItem);
    }
  }

  // פונקציה לריקון העגלה (תופעל אחרי הזמנה מוצלחת)
  async clearCart(cartId: number) {
    await this.cartItemRepository.delete({ cart: { id: cartId } });
  }

  // פונקציה להסרת פריט ספציפי מהעגלה
  async removeItem(userId: number, productId: number) {
    const cart = await this.findCartByUserId(userId);
    
    // מחפשים את הפריט הספציפי שרוצים למחוק
    const itemToDelete = cart.items.find((item) => item.product.id === productId);

    if (!itemToDelete) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(itemToDelete);
    
    return { message: 'Item removed successfully', cartId: cart.id };
  }

  // פונקציה לעדכון כמות פריט בעגלה 
  async updateItemQuantity(userId: number, productId: number, quantity: number) {
    const cart = await this.findCartByUserId(userId);
    const item = cart.items.find((i) => i.product.id === productId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    // בדיקת כמות תקינה
    if (quantity <= 0) {
       throw new BadRequestException('Quantity must be greater than 0');
    }

    // בדיקת מלאי (חשוב!)
    if (quantity > item.product.stock) {
        throw new BadRequestException(`Not enough stock. Max available: ${item.product.stock}`);
    }

    item.quantity = quantity;
    return this.cartItemRepository.save(item);
  }
}