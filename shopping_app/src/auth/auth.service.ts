import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto'; // וודא שהנתיב נכון
import { first } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. אימות משתמש (בודק שם וסיסמה)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. התחברות (מנפיק טוקן)
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, firstName: user.firstName, lastName: user.lastName, picture: user.picture };
    return {
      access_token: this.jwtService.sign(payload),
      user:payload
    };
  }

  // 3. הרשמה (יוצר משתמש ומחזיר טוקן)
  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    // אחרי הרשמה מוצלחת, מבצעים התחברות אוטומטית
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    };
  }

  async googleLogin(profile: any) {
    if (!profile) {
       throw new BadRequestException('No profile from google');
    }

    // 1. קוראים ל-UsersService (שתיקנו קודם)
    const user = await this.usersService.findOrCreateOAuthUser(profile);

    // 2. מייצרים טוקן (כמו בלוגין רגיל)
    return this.login(user);
  }
}
