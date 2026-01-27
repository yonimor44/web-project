import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { OneToMany } from 'typeorm';
import {Cart} from "../../cart/entities/cart.entity";
import {OneToOne} from "typeorm";

// מגדיר שיש לנו enum לתפקידים - למניעת שגיאות כתיב
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true }) // שדה לא חובה למשתמשים שנרשמים דרך גוגל
  googleId?: string;

  @Column({ default: 'local' }) // ברירת מחדל: משתמש רגיל
  provider: string
  
  @Column()
  firstName: string;

  @Column({ nullable: true })
  picture: string;

  @Column()
  lastName: string;

  // --- שדות חדשים לכתובת ברירת מחדל ---
  @Column({ nullable: true })
  defaultAddress: string;

  @Column({ nullable: true })
  defaultCity: string;

  @Column({ nullable: true })
  defaultPhone: string;
  // ------------------------------------

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: true
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date; // שומר אוטומטית מתי נוצר המשתמש

  @UpdateDateColumn()
  updatedAt: Date; // שומר אוטומטית מתי עודכן לאחרונה

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;
}