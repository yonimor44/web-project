import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // הקשר למשתמש: לכל משתמש עגלה אחת (OneToOne)
  @OneToOne(() => User, (user) => user.cart, { onDelete: 'CASCADE' })
  @JoinColumn() // הצד הזה מחזיק את ה-Foreign Key
  user: User;

  // הקשר לפריטים: עגלה אחת מכילה הרבה פריטים
  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];
}