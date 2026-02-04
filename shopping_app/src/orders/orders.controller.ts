import { Controller, Get, Post, UseGuards, Request, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

// בקר הזמנות - מחייב חיבור
@Controller('orders')
@UseGuards(AuthGuard('jwt')) 
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ביצוע הזמנה
  @Post() 
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(
        req.user.userId, 
        createOrderDto, 
        createOrderDto.selectedItemIds 
    );
  }

  // כל ההזמנות (Admin)
  @Get('all') 
  @UseGuards(RolesGuard) 
  @Roles('admin') 
  findAll() {
    return this.ordersService.findAll();
  }

  // ההזמנות שלי
  @Get() 
  findMyOrders(@Request() req) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  // שינוי סטטוס (Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/status') 
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(+id, status);
  }
}