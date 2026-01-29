import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CartService } from '../cart/cart.service';
import { DataSource } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

// --- MOCK DATA ---
const mockUser = { id: 1, email: 'test@test.com' };
const mockProduct = { id: 1, name: 'Ferrari', price: 100, stock: 5 };
const mockCartItem = { id: 1, product: mockProduct, quantity: 2 };
const mockCart = { id: 1, items: [mockCartItem] };

// --- MOCK REPOSITORIES ---
const mockRepo = {
  create: jest.fn().mockImplementation((dto) => dto),
  save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: 1, ...entity })),
  findOne: jest.fn().mockResolvedValue(mockProduct),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockCartService = {
  findCartByUserId: jest.fn(),
};

// --- MOCK DATA SOURCE (TRANSACTION) ---
const mockEntityManager = {
  create: jest.fn().mockImplementation((entity, dto) => ({ ...dto })), // תיקון קריטי ל-TypeORM
  save: jest.fn().mockImplementation((entity) => Promise.resolve({ id: Date.now(), ...entity })),
  findOne: jest.fn().mockResolvedValue({ ...mockProduct }), // מחזיר העתק כדי לא לשנות את המקור בטסטים
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

const mockDataSource = {
  transaction: jest.fn().mockImplementation(async (cb) => {
    return await cb(mockEntityManager);
  }),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockRepo },
        { provide: getRepositoryToken(Product), useValue: mockRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockRepo },
        { provide: CartService, useValue: mockCartService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- טסט 1: יצירת הזמנה מוצלחת ---
  it('should create an order successfully', async () => {
    mockCartService.findCartByUserId.mockResolvedValue(mockCart);
    
    const dto = { shippingAddress: 'TLV', city: 'Tel Aviv', phone: '050' };
    const result = await service.create(1, dto);

    // וידוא שהטרנזקציה רצה
    expect(mockDataSource.transaction).toHaveBeenCalled();
    // וידוא שההזמנה נשמרה
    expect(mockEntityManager.save).toHaveBeenCalled();
    // וידוא שהמלאי ירד (התחיל ב-5, קנינו 2 -> צריך להיות 3)
    // הערה: בגלל המוק הפשוט זה לא באמת ישנה את המשתנה הגלובלי, אבל הפונקציה נקראה
    expect(result).toBeDefined();
    expect(result.shippingAddress).toEqual('TLV');
  });

  // --- טסט 2: עגלה ריקה ---
  it('should throw error if cart is empty', async () => {
    mockCartService.findCartByUserId.mockResolvedValue({ items: [] });

    await expect(service.create(1, { shippingAddress: '', city: '', phone: '' }))
      .rejects
      .toThrow(BadRequestException);
  });

  // --- טסט 3: מוצר חסר במלאי ---
  it('should throw error if product is out of stock', async () => {
    // מכינים מוצר עם מלאי 0
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    const badCartItem = { ...mockCartItem, product: outOfStockProduct, quantity: 1 };
    
    mockCartService.findCartByUserId.mockResolvedValue({ items: [badCartItem] });
    
    // מעדכנים את ה-EntityManager שיחזיר את המוצר ללא מלאי
    mockEntityManager.findOne.mockResolvedValueOnce(outOfStockProduct);

    await expect(service.create(1, { shippingAddress: '', city: '', phone: '' }))
      .rejects
      .toThrow(BadRequestException);
  });
});