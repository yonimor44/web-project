import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Delete, Param } from '@nestjs/common';

@Controller('cart')
@UseGuards(AuthGuard('jwt')) // חובה להיות מחובר לכל הפעולות פה
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@Request() req) {
    return this.cartService.findCartByUserId(req.user.userId);
  }

  @Post('items')
  addItem(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.userId, addToCartDto);
  }

  @Delete('items/:productId') // הכתובת תהיה למשל: /cart/items/1
  removeItem(@Request() req, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, +productId); // ה- + הופך את הסטרינג למספר
  }

  @Post('update-quantity') // נשתמש ב-Post לצורך הפשטות
  updateQuantity(@Request() req, @Body() body: { productId: number; quantity: number }) {
    return this.cartService.updateItemQuantity(req.user.userId, body.productId, body.quantity);
  }
}