import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

// הגדרת הסטטוסים האפשריים
export enum OrderStatus {
  PENDING = 'pending',       // התקבל
  PROCESSING = 'Processing', // בטיפול
  SHIPPED = 'Shipped',       // נשלח
  DELIVERED = 'Delivered',   // הגיע ליעד
  CANCELLED = 'Cancelled',   // בוטל
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  orderDate: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    nullable: true
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  // --- הוספה: פרטי משלוח (חובה לכל הזמנה) ---
  @Column()
  shippingAddress: string;

  @Column()
  city: string;

  @Column()
  phone: string;
  // ------------------------------------------

  // קשר למשתמש (משתמש אחד -> הרבה הזמנות)
  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  // קשר לפריטים (הזמנה אחת -> הרבה פריטים)
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];
}