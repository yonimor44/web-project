import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. אימות משתמש (בודק שם וסיסמה)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    // אם המשתמש קיים והסיסמה תואמת להצפנה
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. התחברות (מנפיק טוקן)
  async login(user: any) {

    console.log('LOGIN DEBUG -> User Data:', user); 
    // -------------------------
    const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role, 
        firstName: user.firstName, 
        lastName: user.lastName,
        picture: user.picture 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: payload
    };
  }

  // 3. הרשמה (יוצר משתמש ומחזיר טוקן)
  async register(createUserDto: CreateUserDto) {
    // הערה: הסרנו את הבדיקה אם המשתמש קיים ואת ההצפנה מכאן.
    // ה-UsersService כבר עושה את שניהם, ואין צורך לעשות עבודה כפולה.
    
    // שולחים את הסיסמה *הרגילה* (לא מוצפנת) ל-UsersService
    const newUser = await this.usersService.create(createUserDto);

    // אחרי הרשמה מוצלחת, מבצעים התחברות אוטומטית
    return this.login(newUser);
  }

  async googleLogin(profile: any) {
    if (!profile) {
       throw new BadRequestException('No profile from google');
    }

    // 1. קוראים ל-UsersService
    const user = await this.usersService.findOrCreateOAuthUser(profile);

    // 2. מייצרים טוקן
    return this.login(user);
  }
}