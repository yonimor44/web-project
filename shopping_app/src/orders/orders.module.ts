import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsModule } from 'src/products/products.module';
import { CartModule } from 'src/cart/cart.module';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, CartItem]), // <--- רישום שתי הטבלאות
    ProductsModule, 
    CartModule, 
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}