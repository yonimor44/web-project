import { Controller, Get, Post, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; 
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.validateUser(signInDto.email, signInDto.password)
      .then((user) => this.authService.login(user));
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    // 1. קבלת התוצאה מהסרוויס
    const result = await this.authService.googleLogin(req.user);
    
    // --- הדפסת בדיקה (חשוב מאוד!) ---
    console.log('🔍 התוצאה שחזרה מ-GoogleLogin:', result);
    console.log('🔑 הטוקן שנשלח לריאקט:', result.access_token);
    // ---------------------------------

    // בדיקת הגנה: אם אין טוקן, לא מפנים סתם
    if (!result || !result.access_token) {
        return res.redirect('http://localhost:5173/login?error=no_token');
    }

    // 2. הפניה לריאקט עם הטוקן
    res.redirect(`http://localhost:5173/auth/callback?token=${result.access_token}`);
  }
}