import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartService } from '../cart/cart.service';
import { Product } from '../products/entities/product.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

// שירות ניהול הזמנות - כולל טרנזקציות ומלאי
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

  // יצירת הזמנה חדשה (תהליך Checkout)
  async create(userId: number, createOrderDto: CreateOrderDto, selectedItemIds?: number[]) {
    // 1. שליפת העגלה
    const cart = await this.cartService.findCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. סינון פריטים (אם נבחרו ספציפית)
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

    // --- התחלת טרנזקציה (מבטיח שהכל יקרה או כלום) ---
    return this.dataSource.transaction(async (manager) => {
      
      // A. יצירת רשומת הזמנה ראשונית
      const order = manager.create(Order, {
        user: { id: userId },
        status: OrderStatus.PENDING,
        totalAmount: 0, 
        shippingAddress: createOrderDto.shippingAddress,
        city: createOrderDto.city,
        phone: createOrderDto.phone,
      });
      
      const savedOrder = await manager.save(order);

      // B. לולאה על הפריטים: בדיקת מלאי, יצירת שורות ועדכון
      let totalAmount = 0;
      const itemIdsToDelete: number[] = [];

      for (const cartItem of itemsToOrder) {
        // נעילת מוצר בתוך הטרנזקציה
        const product = await manager.findOne(Product, { 
            where: { id: cartItem.product.id } 
        });

        if (!product) {
             throw new BadRequestException(`Product not found`);
        }

        const priceAtPurchase = product.price;

        // בדיקת מלאי קריטית
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

        // עדכון המלאי ב-DB
        product.stock -= cartItem.quantity;
        await manager.save(product);

        totalAmount += priceAtPurchase * cartItem.quantity;
        itemIdsToDelete.push(cartItem.id);
      }

      // C. עדכון סכום סופי
      savedOrder.totalAmount = totalAmount;
      await manager.save(savedOrder);

      // D. ניקוי הפריטים מהעגלה
      if (itemIdsToDelete.length > 0) {
          await manager.delete(CartItem, { id: In(itemIdsToDelete) });
      }

      return savedOrder;
    }); 
  }
  
  // שליפת כל ההזמנות (Admin)
  async findAll() {
    return this.ordersRepository.find({ 
        relations: ['user', 'items', 'items.product'],
        order: { orderDate: 'DESC' }
    });
  }

  // שליפת הזמנות למשתמש
  async findMyOrders(userId: number) {
     return this.ordersRepository.find({ 
       where: { user: { id: userId } },
       relations: ['items', 'items.product'],
       order: { orderDate: 'DESC' } 
     });
  }

  // עדכון סטטוס (Admin)
  async updateStatus(id: number, status: string) {
    return this.ordersRepository.update(id, { status: status as any });
  }
}