import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

/**
 * שירות האבטחה (Authentication Service).
 * אחראי על אימות זהות המשתמש והנפקת אסימוני גישה (JWT).
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // אימות פרטי משתמש (בדיקת אימייל והשוואת סיסמאות)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // הסרת הסיסמה מהאובייקט המוחזר
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

// יצירת טוקן JWT לאחר אימות מוצלח
  async login(user: any) {
    console.log('LOGIN DEBUG -> Generating Token for:', user.email);

    // ה-Payload הוא המידע שיישמר בתוך הטוקן המוצפן
    const payload = {
      email: user.email,
      sub: user.id, // Subject (מזהה המשתמש לפי סטנדרט JWT)
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

// הרשמה וחיבור מידי (חוסך לוגין כפול מהלקוח)
  async register(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    return this.login(newUser);
  }

// טיפול בכניסה דרך גוגל
  async googleLogin(profile: any) {
    if (!profile) {
      throw new BadRequestException('No profile data received from Google');
    }

    const user = await this.usersService.findOrCreateOAuthUser(profile);
    return this.login(user);
  }
}