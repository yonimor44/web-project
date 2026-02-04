import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { CartService } from 'src/cart/cart.service';

/**
 * שירות (Service) לניהול משתמשים.
 * אחראי על כל הפעולות העסקיות הקשורות למשתמשים: יצירה, שליפה, עדכון ואבטחה.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cartService: CartService,
  ) {}

  /**
   * יוצר משתמש חדש במערכת (הרשמה רגילה).
   * הפונקציה מבצעת:
   * 1. בדיקה אם האימייל תפוס.
   * 2. הצפנת הסיסמה (Hashing).
   * 3. יצירת עגלת קניות התחלתית למשתמש.
   */
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // יצירת מלח (Salt) והצפנת הסיסמה
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      provider: 'local',
      role: UserRole.USER,
    });

    const savedUser = await this.usersRepository.save(user);

    // ניסיון ליצור עגלה (אי-הצלחה לא תכשיל את יצירת המשתמש, אלא רק תודפס בלוג)
    try {
      await this.cartService.createForUser(savedUser);
    } catch (e) {
      console.error("Failed to create initial cart for user", e);
    }

    return savedUser;
  }

  async findAll() {
    return this.usersRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findOneById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  // עדכון פרופיל חלקי (רק מה שנשלח מתעדכן)
  async updateProfile(id: number, attrs: Partial<User>) {
    const user = await this.findOneById(id);

    if (attrs.firstName) user.firstName = attrs.firstName;
    if (attrs.lastName) user.lastName = attrs.lastName;
    
 // עדכון כתובות ברירת מחדל
    if (typeof attrs.defaultAddress === 'string') user.defaultAddress = attrs.defaultAddress;
    if (typeof attrs.defaultCity === 'string') user.defaultCity = attrs.defaultCity;
    if (typeof attrs.defaultPhone === 'string') user.defaultPhone = attrs.defaultPhone;

    return this.usersRepository.save(user);
  }

 // תהליך שינוי סיסמה (דורש אימות סיסמה ישנה)
  async changePassword(id: number, currentPass: string, newPass: string) {
    console.log(`DEBUG SERVICE: Searching for User ID: ${id}`);

    // שימוש ב-QueryBuilder כדי לשלוף את שדה הסיסמה (שבדרך כלל מוסתר)
    const user = await this.usersRepository.createQueryBuilder("user")
      .addSelect("user.password")
      .addSelect("user.provider")
      .where("user.id = :id", { id })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.provider === 'google' || !user.password) {
      throw new BadRequestException('Cannot change password for users registered via Google');
    }

    // אימות הסיסמה הישנה
    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password provided is incorrect');
    }

    // הצפנת הסיסמה החדשה
    const salt = await bcrypt.genSalt();
    const newHash = await bcrypt.hash(newPass, salt);

    await this.usersRepository.update(id, { password: newHash });

    return { message: 'Password updated successfully' };
  }

  // עדכון תפקיד (Admin Only)
  async updateRole(id: number, role: string) {
    return this.usersRepository.update(id, { role: role as any });
  }

  
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

    // אם סופקה סיסמה חדשה בעדכון כללי - יש להצפין אותה
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

// לוגיקה לטיפול במשתמש שמגיע מגוגל
  async findOrCreateOAuthUser(profile: any) {
    const email = profile.email;
    let user = await this.usersRepository.findOne({
       where: { email },
    });

    // תרחיש 1: משתמש קיים
    if (user) {
      if (profile.picture && user.picture !== profile.picture) {
        user.picture = profile.picture;
      }
      if (!user.googleId) {
        user.googleId = profile.id;
      }
      await this.usersRepository.save(user);

      // וידוא שיש עגלה (למקרה שנמחקה או באג היסטורי)
      const cart = await this.cartService.findCartByUserId(user.id);
      if (!cart) await this.cartService.createForUser(user);

      return user;
    }

    // תרחיש 2: משתמש חדש
    const newUser = this.usersRepository.create({
      email: email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      googleId: profile.id,
      picture: profile.picture,
      provider: 'google',
      password: '', // אין סיסמה למשתמשי גוגל
      role: UserRole.USER,
    });

    const savedUser = await this.usersRepository.save(newUser);
    await this.cartService.createForUser(savedUser);
    
    return savedUser;
  }
}