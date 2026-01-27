import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    // התיקון: אנחנו מחזירים אובייקט שיש בו שדה 'id' ברור
    return { 
        id: payload.sub,      // <--- זה מה שהקונטרולר מחפש!
        userId: payload.sub,  // שומרים גם את זה לגיבוי
        email: payload.email, 
        role: payload.role 
    };
  }
}