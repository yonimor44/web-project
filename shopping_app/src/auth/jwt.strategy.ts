import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common'; // <--- הוספנו את ה-Exception
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // 1. שליפה בטוחה של הסוד
    const secret = configService.get<string>('JWT_SECRET');

    // 2. הגנה כפולה: מוודאים שהסוד קיים גם כאן
    if (!secret) {
        throw new Error('FATAL ERROR: JWT_SECRET is missing in .env configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // בטוח לשימוש
    });
  }

  async validate(payload: any) {
    // 3. הגנה נוספת: אם הטוקן פוענח אבל אין בו תוכן (נדיר, אבל קורה)
    if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
    }

    // החזרת המשתמש המאומת ל-Request
    return { 
        id: payload.sub,
        userId: payload.sub,
        email: payload.email, 
        role: payload.role 
    };
  }
}