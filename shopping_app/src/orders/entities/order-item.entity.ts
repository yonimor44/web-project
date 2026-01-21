import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) 
  price: number; // המחיר ברגע הקנייה - קריטי!

  // קשר להזמנה (הזמנה אחת מכילה הרבה פריטים)
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  // קשר למוצר (פריט מצביע על מוצר אחד)
  @ManyToOne(() => Product)
  product: Product;
}