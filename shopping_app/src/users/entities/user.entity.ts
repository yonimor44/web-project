import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Cart } from '../../cart/entities/cart.entity';

// הגדרת תפקידים (מונע שגיאות כתיב בקוד)
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// ישות משתמש - טבלת הליבה של המערכת
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

 // סיסמה היא אופציונלית כי למשתמשי גוגל אין סיסמה בשרת שלנו
  @Column({ nullable: true })
  password: string;

  
   // מזהה ייחודי המתקבל מ-Google OAuth.
   // משמש לזיהוי המשתמש בכניסות חוזרות דרך גוגל.
  @Column({ nullable: true })
  googleId?: string;

  
// ספק האימות: 'local' או 'google'.
  
  @Column({ default: 'local' })
  provider: string;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  picture: string;

  @Column()
  lastName: string;

  // --- שדות לכתובת ברירת מחדל (לזירוז ה-Checkout) ---

  @Column({ nullable: true })
  defaultAddress: string;

  @Column({ nullable: true })
  defaultCity: string;

  @Column({ nullable: true })
  defaultPhone: string;

  // תפקיד המשתמש במערכת
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    nullable: true,
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

 // משתמש אחד יכול לבצע הזמנות רבות
  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  // למשתמש יש עגלה אחת פעילה
  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;
}