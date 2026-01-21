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

    // 2. הצפנת הסיסמה (Hashing)
    const salt = await bcrypt.genSalt(); // יצירת "מלח" (תוספת אקראית להצפנה)
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. יצירת האובייקט לשמירה (עם הסיסמה המוצפנת במקום המקורית)
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      // תוספת חשובה: מסמנים שהמשתמש הזה נרשם רגיל ('local')
      provider: 'local', 
    });

    // 4. שמירה במסד הנתונים
    const savedUser = await this.usersRepository.save(user);

    // 5. יצירת עגלה ריקה למשתמש החדש
    await this.cartService.createForUser(savedUser);

    return savedUser;
  }

  // ======================================================
  // פעולות שליפה ועדכון (CRUD)
  // ======================================================

  // חיפוש לפי אימייל (משמש בעיקר את ה-AuthService בהתחברות)
  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  // חיפוש לפי ID (כולל זריקת שגיאה אם לא נמצא)
  async findOneById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  // עדכון פרטי משתמש
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);

    // אם מנסים לעדכן סיסמה, צריך להצפין אותה מחדש
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // מיזוג העדכונים לתוך המשתמש הקיים ושמירה
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  // מחיקת משתמש
  async remove(id: number) {
    const user = await this.findOneById(id);
    return this.usersRepository.remove(user);
  }

  // ======================================================
  // הוספה חדשה: טיפול במשתמשי גוגל (OAuth)
  // ======================================================
  async findOrCreateOAuthUser(profile: any) {
    const email = profile.email;
    
    // 1. מחפשים האם המשתמש כבר קיים אצלנו לפי האימייל
    let user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      if (profile.picture && user.picture !== profile.picture) {
        user.picture = profile.picture;
      }

      if (!user.googleId) {
        user.googleId = profile.id;
      }
        // אנו לא משנים את ה-provider ל-'google' אם הוא היה 'local', 
        // כדי לשמור על היסטוריית ההרשמה המקורית שלו.
        await this.usersRepository.save(user);
      return user;
    }

    // 2. אם המשתמש לא קיים - יוצרים משתמש חדש
    const newUser = this.usersRepository.create({
      email: email,
      firstName: profile.firstName, 
      lastName: profile.lastName,
      googleId: profile.id, // שומרים את המזהה של גוגל
      picture: profile.picture, // <--- הוספנו: שמירת התמונה
      provider: 'google',   // מסמנים שהוא נרשם דרך גוגל
      password: '',         // אין לו סיסמה אצלנו!
      role: UserRole.USER      // ברירת מחדל: לקוח רגיל
    });

    const savedUser = await this.usersRepository.save(newUser);
    
    // 3. לא לשכוח: גם למשתמש גוגל מגיעה עגלה!
    await this.cartService.createForUser(savedUser);
    
    return savedUser;
  }
}