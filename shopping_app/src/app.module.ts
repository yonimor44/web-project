import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
// --- הייבוא החדש של הולידציה ---
import { validate } from './config/env.validation'; 

@Module({
  imports: [
    // 1. הגדרת מגבלת בקשות (Rate Limiting)
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // 2. חיבור הולידציה למשתני הסביבה
    ConfigModule.forRoot({
      isGlobal: true,
      validate, // <--- המפתח שמפעיל את הבדיקות!
    }),

    // 3. חיבור לדאטה-בייס (משתמש בערכים המאומתים)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'), // הערך כבר הומר למספר בולידציה
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // לזכור לשנות ל-false בייצור!
      }),
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    OrdersModule,
    CartModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}