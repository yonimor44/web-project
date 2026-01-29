import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

// --- התיקון: שינוי לנתיבים יחסיים (../) במקום src ---
// זה מה שפותר את השגיאה בטסטים
import { CartService } from '../cart/cart.service';
import { Product } from '../products/entities/product.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private cartService: CartService,
    private dataSource: DataSource,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto, selectedItemIds?: number[]) {
    // 1. שליפת העגלה
    const cart = await this.cartService.findCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. סינון פריטים
    let itemsToOrder: CartItem[] = [];
    
    if (selectedItemIds && selectedItemIds.length > 0) {
        const ids = selectedItemIds.map(id => Number(id));
        itemsToOrder = cart.items.filter(item => ids.includes(item.id));
    } else {
        itemsToOrder = cart.items;
    }

    if (itemsToOrder.length === 0) {
        throw new BadRequestException('No items selected for checkout');
    }

    // --- התחלת הטרנזקציה ---
    return this.dataSource.transaction(async (manager) => {
      
      // A. יצירת ההזמנה
      const order = manager.create(Order, {
        user: { id: userId },
        status: OrderStatus.PENDING,
        totalAmount: 0, 
        shippingAddress: createOrderDto.shippingAddress,
        city: createOrderDto.city,
        phone: createOrderDto.phone,
      });
      
      const savedOrder = await manager.save(order);

      // B. עיבוד פריטים ומלאי
      let totalAmount = 0;
      const itemIdsToDelete: number[] = [];

      for (const cartItem of itemsToOrder) {
        // שליפה מחדש בתוך הטרנזקציה לנעילת המלאי
        const product = await manager.findOne(Product, { where: { id: cartItem.product.id } });

        if (!product) {
             throw new BadRequestException(`Product not found`);
        }

        const priceAtPurchase = product.price;

        // בדיקת מלאי
        if(product.stock < cartItem.quantity){
          throw new BadRequestException(`Product ${product.name} is out of stock`);
        }

        // יצירת שורת פריט
        const orderItem = manager.create(OrderItem, {
          order: savedOrder,
          product: product,
          quantity: cartItem.quantity,
          price: priceAtPurchase,
        });

        await manager.save(orderItem);

        // עדכון מלאי
        product.stock -= cartItem.quantity;
        await manager.save(product);

        totalAmount += priceAtPurchase * cartItem.quantity;
        
        itemIdsToDelete.push(cartItem.id);
      }

      // C. עדכון הסכום הסופי
      savedOrder.totalAmount = totalAmount;
      await manager.save(savedOrder);

      // D. מחיקה מהעגלה
      if (itemIdsToDelete.length > 0) {
          await manager.delete(CartItem, { id: In(itemIdsToDelete) });
      }

      return savedOrder;
    }); 
  }
  
  // שאר הפונקציות
  async findAll() {
    return this.ordersRepository.find({ 
        relations: ['user', 'items', 'items.product'],
        order: { orderDate: 'DESC' }
    });
  }

  async findMyOrders(userId: number) {
     return this.ordersRepository.find({ 
       where: { user: { id: userId } },
       relations: ['items', 'items.product'],
       order: { orderDate: 'DESC' } 
     });
  }

  async updateStatus(id: number, status: string) {
    return this.ordersRepository.update(id, { status: status as any });
  }
}