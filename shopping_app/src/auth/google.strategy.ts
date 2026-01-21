import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'), // וודא שיש לך את זה ב-.env
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'), // וודא שיש לך את זה ב-.env
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'), // http://localhost:3000/auth/google/redirect
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // הפונקציה הזו רצה ברגע שגוגל אישרו את המשתמש
    // אנחנו פשוט מחזירים את הפרופיל כדי שה-Controller יוכל להשתמש בו
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      id: profile.id, // זה ה-GoogleID
    };
    done(null, user);
  }
}