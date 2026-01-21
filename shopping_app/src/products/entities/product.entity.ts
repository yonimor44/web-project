import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // לדוגמה: "Mustang GT"

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  stock: number;

  @Column()
  category: string; // לדוגמה: "Muscle", "Sports"

  @Column()
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  // --- שדות חדשים שהוספנו לחנות דגמים ---
  // שמתי nullable: true למקרה שיש לך כבר מוצרים ב-DB שלא יקרסו
  
  @Column({ nullable: true }) 
  brand: string; // יצרן הדגם: Burago, Maisto

  @Column({ nullable: true })
  carMake: string; // יצרן הרכב: Ford, Ferrari

  @Column({ nullable: true })
  scale: string; // קנה מידה: 1:18, 1:24

  @Column({ nullable: true })
  color: string; // צבע הדגם: Red, Black
  // ---------------------------------------

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // --- החיבורים הקיימים שלך (לא נגענו!) ---
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}