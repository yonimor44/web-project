import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // 1. שליפה בטוחה של הסוד
    const secret = configService.get<string>('JWT_SECRET');

    // 2. בדיקה קריטית: אם אין סוד, השרת חייב לעצור!
    if (!secret) {
        throw new Error('FATAL ERROR: JWT_SECRET is missing in .env configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // עכשיו זה בטוח, בלי סימן קריאה
    });
  }

  async validate(payload: any) {
    // התיקון הקודם שלך נשמר - הוא מצוין
    return { 
        id: payload.sub,
        userId: payload.sub,
        email: payload.email, 
        role: payload.role 
    };
  }
}