import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus} from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from 'src/cart/cart.service';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private cartService: CartService, // הזרקת העגלה
  ) {}

  async create(userId: number) {
    // 1. שליפת העגלה של המשתמש
    const cart = await this.cartService.findCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. יצירת ההזמנה הראשית (ה"קבל")
    const order = this.ordersRepository.create({
      user: { id: userId },
      status: OrderStatus.PENDING,
      totalAmount: 0, // נחשב את זה תכף
    });
    
    // שומרים כדי לקבל ID להזמנה
    const savedOrder = await this.ordersRepository.save(order);

    // 3. המרת פריטי עגלה -> לפריטי הזמנה (Snapshot)
    let totalAmount = 0;
    
    for (const cartItem of cart.items) {
      const priceAtPurchase = cartItem.product.price; // המחיר ברגע הקנייה
    
      // בדיקת מלאי
      if(cartItem.product.stock < cartItem.quantity){
        throw new BadRequestException(`Product ${cartItem.product.name} is out of stock`);
      }

      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: priceAtPurchase, // שומרים את המחיר ההיסטורי
      });

      await this.orderItemsRepository.save(orderItem);

      // עדכון מלאי המוצר
      cartItem.product.stock -= cartItem.quantity;
      await this.productsRepository.save(cartItem.product);

      // חישוב הסכום הכולל
      totalAmount += priceAtPurchase * cartItem.quantity;
    }

    // 4. עדכון הסכום הסופי בהזמנה
    savedOrder.totalAmount = totalAmount;
    await this.ordersRepository.save(savedOrder);

    // 5. ריקון העגלה
    await this.cartService.clearCart(cart.id);

    return savedOrder;
  }
  
  // פונקציה למנהלים: לראות את כל ההזמנות
  async findAll() {
    return this.ordersRepository.find({ relations: ['user', 'items', 'items.product'] });
  }

  // פונקציה למשתמש: לראות את ההזמנות שלי
  async findMyOrders(userId: number) {
     return this.ordersRepository.find({ 
       where: { user: { id: userId } },
       relations: ['items', 'items.product'] 
     });
  }
} 