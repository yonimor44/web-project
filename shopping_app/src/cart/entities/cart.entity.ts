import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

// ישות עגלת קניות
@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // קשר 1:1 למשתמש
  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  // קשר 1:N לפריטים
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}