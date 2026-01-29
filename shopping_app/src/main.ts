import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. אבטחת CORS משודרגת (דרישת אבטחה)
  // במקום מחרוזת אחת, אנחנו מגדירים במדויק מה מותר ומה אסור
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  
  app.enableCors({
    origin: frontendUrl,        // רק הפרונט שלנו יכול לגשת
    credentials: true,          // מאפשר שליחת Cookies ו-Headers מאובטחים
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'], // הגדרה מפורשת כ-Array
    allowedHeaders: ['Content-Type', 'Authorization'], // מונע הזרקת Headers זדוניים
  });

  // 2. חיבור אינטרספטורים ופילטרים (לוגים ושגיאות)
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. Validation Pipe משופר
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // מסנן שדות שלא קיימים ב-DTO (אבטחה)
    forbidNonWhitelisted: true, // זורק שגיאה אם מישהו שולח שדות זבל
    transform: true,            // ממיר אוטומטית את המידע לטיפוס הנכון
    transformOptions: {
      enableImplicitConversion: true, // <--- תוספת חשובה!
      // זה גורם לכך שאם שולחים מספר ב-Query Params (שהוא תמיד מגיע כ-String),
      // השרת ידע להפוך אותו למספר באופן אוטומטי בלי לשבור את ה-DTO.
    },
  }));

  // 4. הגדרת Session מאובטחת
  const sessionSecret = configService.get<string>('SESSION_SECRET');
  if (!sessionSecret) {
    // Fail Fast: אם אין סוד, השרת לא עולה. זה מונע פרצות אבטחה חמורות.
    throw new Error('FATAL ERROR: SESSION_SECRET is not defined in .env');
  }

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // בייצור חייב HTTPS
        httpOnly: true, // מגן מפני גניבת Session ע"י סקריפטים (XSS)
        maxAge: 1000 * 60 * 60 * 24, // תוקף ליום אחד
      }
    }),
  );

  // 5. הגדרת SWAGGER (תיעוד)
  const config = new DocumentBuilder()
    .setTitle('Shopping App API')
    .setDescription('The API documentation for the Car Model Store')
    .setVersion('1.0')
    .addBearerAuth() // מוסיף את כפתור המנעול לטוקנים
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // הפעלה
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api`);
  console.log(`CORS Policy active for: ${frontendUrl}`);
}
bootstrap();