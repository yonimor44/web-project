import { Controller, Get, Post, UseGuards, Request, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard('jwt')) 
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post() 
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // --- התיקון: אנחנו מעבירים גם את ה-selectedItemIds מתוך ה-DTO ---
    return this.ordersService.create(
        req.user.userId, 
        createOrderDto, 
        createOrderDto.selectedItemIds // <--- הוספנו את זה
    );
  }

  @Get('all') 
  @UseGuards(RolesGuard) 
  @Roles('admin') 
  findAll() {
    return this.ordersService.findAll();
  }

  @Get() 
  findMyOrders(@Request() req) {
    return this.ordersService.findMyOrders(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/status') 
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(+id, status);
  }
}