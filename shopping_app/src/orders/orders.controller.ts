import { Controller, Get, Post, UseGuards, Request, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard('jwt')) // ברירת מחדל: הכל דורש התחברות
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post() // POST /orders -> מבצע הזמנה
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  // --- החדש: מסלול לאדמין בלבד לקבלת כל ההזמנות ---
  @Get('all') // GET /orders/all
  @UseGuards(RolesGuard) // מפעיל את השומר שבודק תפקידים
  @Roles('admin') // רק מי שיש לו role: 'admin' יכול להיכנס
  findAll() {
    return this.ordersService.findAll();
  }
  // ------------------------------------------------

  @Get() // GET /orders -> מביא את ההזמנות שלי
  findMyOrders(@Request() req) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/status') // PATCH /orders/12/status
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(+id, status);
  }
}