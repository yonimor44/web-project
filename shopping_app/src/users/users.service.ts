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
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const salt = await bcrypt.genSalt(); 
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, 
      provider: 'local', 
      role: UserRole.USER // ברירת מחדל
    });

    const savedUser = await this.usersRepository.save(user);

    try {
        await this.cartService.createForUser(savedUser);
    } catch (e) {
        console.error("Failed to create cart for user", e);
    }

    return savedUser;
  }

  // --- חדש: פונקציה עבור האדמין לקבלת כל המשתמשים ---
  async findAll() {
    return this.usersRepository.find({
        order: { id: 'ASC' }
    });
  }

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

  // --- חדש: עדכון תפקיד המשתמש ---
  async updateRole(id: number, role: string) {
    // אנו ממירים ל-any כדי לעקוף בעיות טיפוס אם הסטרינג מגיע מהלקוח
    return this.usersRepository.update(id, { role: role as any });
  }
  // --------------------------------

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

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

  // OAuth
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
       await this.usersRepository.save(user);
       
       const cart = await this.cartService.findCartByUserId(user.id);
       if (!cart) await this.cartService.createForUser(user);
       
      return user;
    }

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