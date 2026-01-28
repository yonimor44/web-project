import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// --- הוספנו את הייבוא לסוואגר ---
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  
  app.enableCors({
    origin: frontendUrl, 
    credentials: true,   
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            
    forbidNonWhitelisted: true, 
    transform: true,            
  }));

  const sessionSecret = configService.get<string>('SESSION_SECRET');
  if (!sessionSecret) throw new Error('FATAL ERROR: SESSION_SECRET is not defined');

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24, 
      }
    }),
  );

  // --- הגדרת SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Shopping App API')
    .setDescription('The API documentation for the Car Model Store')
    .setVersion('1.0')
    .addBearerAuth() // מוסיף כפתור מנעול לטוקנים
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // ---------------------

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger Docs available at: http://localhost:${port}/api`); // לינק לתיעוד
}
bootstrap();