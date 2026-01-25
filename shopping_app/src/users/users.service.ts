import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cartService: CartService,
  ) {}

  // יצירת משתמש רגיל (הרשמה עם אימייל וסיסמה)
  // ======================================================
  async create(createUserDto: CreateUserDto) {
    // 1. בדיקה אם האימייל כבר קיים במערכת
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // 2. הצפנת הסיסמה (Hashing) - זה המקום היחיד שזה קורה!
    const salt = await bcrypt.genSalt(); 
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. יצירת האובייקט לשמירה
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, // שומרים את המוצפנת
      provider: 'local', 
      role: UserRole.USER // ברירת מחדל, אלא אם כן נשלח אחרת
    });

    // 4. שמירה במסד הנתונים
    const savedUser = await this.usersRepository.save(user);

    // 5. יצירת עגלה ריקה למשתמש החדש
    try {
        await this.cartService.createForUser(savedUser);
    } catch (e) {
        console.error("Failed to create cart for user", e);
        // לא עוצרים את ההרשמה בגלל עגלה, אבל כדאי לדעת
    }

    return savedUser;
  }

  // ======================================================
  // פעולות שליפה ועדכון (CRUD)
  // ======================================================

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  async findOneById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

    // אם מנסים לעדכן סיסמה, צריך להצפין אותה מחדש
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    return this.usersRepository.remove(user);
  }

  // ======================================================
  // OAuth
  // ======================================================
  async findOrCreateOAuthUser(profile: any) {
    const email = profile.email;
    
    let user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      if (profile.picture && user.picture !== profile.picture) {
        user.picture = profile.picture;
      }
      if (!user.googleId) {
        user.googleId = profile.id;
      }
       // מעדכנים אם צריך
       await this.usersRepository.save(user);
       // אם למשתמש אין עגלה (מצב נדיר), ניצור לו
       const cart = await this.cartService.findCartByUserId(user.id);
       if (!cart) await this.cartService.createForUser(user);
       
      return user;
    }

    // יצירת משתמש חדש מגוגל
    const newUser = this.usersRepository.create({
      email: email,
      firstName: profile.firstName, 
      lastName: profile.lastName,
      googleId: profile.id, 
      picture: profile.picture, 
      provider: 'google',   
      password: '',         
      role: UserRole.USER   
    });

    const savedUser = await this.usersRepository.save(newUser);
    await this.cartService.createForUser(savedUser);
    
    return savedUser;
  }
}