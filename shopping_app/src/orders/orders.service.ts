import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // הוספתי In
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from 'src/cart/cart.service';
import { Product } from 'src/products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CartItem } from 'src/cart/entities/cart-item.entity'; // וודא שיש ייבוא

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(CartItem) // הוספת רפוזיטורי כדי למחוק פריטים ספציפיים
    private cartItemRepository: Repository<CartItem>,
    private cartService: CartService,
  ) {}

  // עדכנו את החתימה: selectedItemIds הוא אופציונלי
  async create(userId: number, createOrderDto: CreateOrderDto, selectedItemIds?: number[]) {
    // 1. שליפת העגלה
    const cart = await this.cartService.findCartByUserId(userId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. סינון פריטים: אם נשלחו IDs, לוקחים רק אותם. אחרת את כולם.
    // שים לב: אנחנו מצפים ל-IDs של CartItems, לא של Products
    const itemsToOrder = (selectedItemIds && selectedItemIds.length > 0)
        ? cart.items.filter(item => selectedItemIds.includes(item.id))
        : cart.items;

    if (itemsToOrder.length === 0) {
        throw new BadRequestException('No items selected for checkout');
    }

    // 3. יצירת ההזמנה הראשית
    const order = this.ordersRepository.create({
      user: { id: userId },
      status: OrderStatus.PENDING,
      totalAmount: 0, 
      shippingAddress: createOrderDto.shippingAddress,
      city: createOrderDto.city,
      phone: createOrderDto.phone,
    });
    
    const savedOrder = await this.ordersRepository.save(order);

    // 4. המרת פריטי עגלה -> לפריטי הזמנה
    let totalAmount = 0;
    
    for (const cartItem of itemsToOrder) {
      const priceAtPurchase = cartItem.product.price;

      // בדיקת מלאי
      if(cartItem.product.stock < cartItem.quantity){
        throw new BadRequestException(`Product ${cartItem.product.name} is out of stock`);
      }

      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: priceAtPurchase,
      });

      await this.orderItemsRepository.save(orderItem);

      // עדכון מלאי
      cartItem.product.stock -= cartItem.quantity;
      await this.productsRepository.save(cartItem.product);

      totalAmount += priceAtPurchase * cartItem.quantity;
    }

    // 5. עדכון הסכום הסופי
    savedOrder.totalAmount = totalAmount;
    await this.ordersRepository.save(savedOrder);

    // 6. מחיקת הפריטים שהוזמנו בלבד!
    const itemsToRemove = itemsToOrder.map(item => item.id);
    if (itemsToRemove.length > 0) {
        await this.cartItemRepository.delete({ id: In(itemsToRemove) });
    }

    return savedOrder;
  }
  
  // ... שאר הפונקציות (findAll, findMyOrders, updateStatus) ללא שינוי
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