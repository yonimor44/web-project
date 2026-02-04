import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

// סטטוסים אפשריים להזמנה
export enum OrderStatus {
  PENDING = 'pending',       // ממתין
  PROCESSING = 'Processing', // בטיפול
  SHIPPED = 'Shipped',       // נשלח
  DELIVERED = 'Delivered',   // הגיע
  CANCELLED = 'Cancelled',   // בוטל
}

// ישות הזמנה - מרכזת את כל המידע על הרכישה
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

  // סכום לתשלום (מחושב בעת היצירה)
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0 
  })
  totalAmount: number;

  // --- פרטי משלוח (נשמרים כ-Snapshot) ---

  @Column()
  shippingAddress: string;

  @Column()
  city: string;

  @Column()
  phone: string;

  // --- קשרים ---

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];
}