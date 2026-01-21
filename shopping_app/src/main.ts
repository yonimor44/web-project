import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ה-Pipes המצוינים שלך נשארים כמו שהם
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors();

  // --- הוספה חשובה 2: הגדרת Session לגוגל ---
  app.use(
    session({
      secret: configService.getOrThrow<string>('SESSION_SECRET'), // <--- שימוש במשתנה סביבה
      resave: false,
      saveUninitialized: false,
    }),
  );
  // ------------------------------------------

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();