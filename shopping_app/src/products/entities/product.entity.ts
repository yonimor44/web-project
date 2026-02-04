import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

// ישות מוצר - הטבלה שמחזיקה את כל דגמי המכוניות
@Entity()
export class Product {
 
  @PrimaryGeneratedColumn()
  id: number; // מזהה ייחודי של המוצר

  @Column()
  name: string; // שם המוצר

  @Column({ type: 'text' })
  description: string; // תיאור מפורט של המוצר

  // מחיר המוצר בפורמט עשרוני עם דיוק של 2 ספרות אחרי הנקודה 
  @Column({ 
    type: 'decimal',
    precision: 10,
    scale: 2 // מספר הספרות אחרי הנקודה העשרונית
  })
  price: number;

  @Column({ type: 'int' })
  stock: number; // כמות המלאי הזמינה למוצר 

  @Column()
  category: string; // קטגוריית המוצר
 
  @Column()
  imageUrl: string; // URL לתמונת המוצר

  @Column({ default: true })
  isActive: boolean; // האם המוצר פעיל וזמין למכירה

// --- שדות ייחודיים לדגמי רכב (Car Specs) ---

  @Column({ nullable: true })
  brand: string; // מותג הרכב 

  @Column({ nullable: true })
  carMake: string; // יצרן הרכב 

  @Column({ nullable: true })
  scale: string; // קנה מידה של הדגם 
  @Column({ nullable: true })
  color: string; //` צבע הרכב

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

// --- קשרים עם ישויות אחרות ---

// מוצר יכול להופיע בפריטי עגלה רבים
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

// מוצר יכול להופיע בפריטי הזמנה רבים
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}