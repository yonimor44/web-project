import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * נקודת הכניסה הראשית של האפליקציה (Bootstrap).
 * כאן אנו מגדירים את השרת, אבטחה, ולידציות ותיעוד.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. אבטחת CORS (Cross-Origin Resource Sharing)
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

  app.enableCors({
    origin: frontendUrl, // מאפשר גישה רק מהדומיין של הפרונט
    credentials: true,   // מאפשר העברת עוגיות (Cookies) והדרים מאובטחים
    methods: [
      'GET', 
      'POST', 
      'PUT', 
      'DELETE', 
      'PATCH', 
      'HEAD'
    ],
    allowedHeaders: [
      'Content-Type', 
      'Authorization'
    ],
  });

  // 2. אינטרספטורים ופילטרים גלובליים

  // רישום לוגים לכל בקשה שנכנסת
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // תפיסת שגיאות גלובלית והחזרת תשובה אחידה
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. ולידציה (Validation Pipe)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // מסנן שדות שלא הוגדרו ב-DTO
      forbidNonWhitelisted: true, // זורק שגיאה אם נשלחו שדות אסורים
      transform: true,            // ממיר טיפוסים (למשל string ל-number)
      transformOptions: {
        enableImplicitConversion: true, // המרה אוטומטית חכמה
      },
    }),
  );

  // 4. ניהול Session ו-Cookies
  const sessionSecret = configService.get<string>('SESSION_SECRET');
  
  if (!sessionSecret) {
    throw new Error('FATAL ERROR: SESSION_SECRET is not defined in .env');
  }

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS בייצור
        httpOnly: true, // מניעת גישה ל-Cookie דרך JS (הגנה מ-XSS)
        maxAge: 1000 * 60 * 60 * 24, // תוקף ל-24 שעות
      },
    }),
  );

  // 5. הגדרת Swagger (תיעוד API)
  const config = new DocumentBuilder()
    .setTitle('Shopping App API')
    .setDescription('The API documentation for the Car Model Store')
    .setVersion('1.0')
    .addBearerAuth() // מוסיף תמיכה בטוקן (מנעול) בממשק
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // הפעלת השרת
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger Docs available at: http://localhost:${port}/api`);
  console.log(`🔒 CORS Policy active for: ${frontendUrl}`);
}

bootstrap();