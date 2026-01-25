import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt')) // חייב להיות מחובר
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post() // POST /orders -> מבצע הזמנה ממה שיש בעגלה
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Get() // GET /orders -> מביא את ההזמנות שלי
  findMyOrders(@Request() req) {
    return this.ordersService.findMyOrders(req.user.userId);
  }
}