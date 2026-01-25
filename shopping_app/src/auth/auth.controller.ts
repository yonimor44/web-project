import { Controller, Get, Post, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; 
import { CreateUserDto } from 'src/users/dto/create-user.dto'; // <--- וודא שיש את הייבוא הזה
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: LoginDto) {
    const user = await this.authService.validateUser(signInDto.email, signInDto.password);
    if (!user) {
        // זורק שגיאה אם האימות נכשל (AuthService יטפל בזה או שהקונטרולר יחזיר 401)
        throw new Error('Invalid credentials'); 
    }
    return this.authService.login(user);
  }

  // --- זה החלק שהיה חסר לך וגרם לשגיאת 404! ---
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  // ---------------------------------------------

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    // 1. קבלת התוצאה מהסרוויס
    const result = await this.authService.googleLogin(req.user);

    // בדיקת הגנה: אם אין טוקן, לא מפנים סתם
    if (!result || !result.access_token) {
        return res.redirect('http://localhost:5173/login?error=no_token');
    }

    // 2. הפניה לריאקט עם הטוקן
    res.redirect(`http://localhost:5173/auth/callback?token=${result.access_token}`);
  }
}