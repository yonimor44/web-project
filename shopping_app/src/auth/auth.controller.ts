import { Controller, Get, Post, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

/**
 * בקר האבטחה (Authentication Controller).
 * מנהל את נתיבי הכניסה, ההרשמה והאימות מול צד שלישי (Google).
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Successful login. Returns JWT access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials provided.' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: LoginDto) {
    const user = await this.authService.validateUser(signInDto.email, signInDto.password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created and logged in successfully.' })
  @ApiResponse({ status: 400, description: 'Validation error or Email already exists.' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  // --- Google OAuth Section ---
  
  @ApiOperation({ summary: 'Initiate Google Login' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {
    // נתיב זה מפעיל את ה-Guard של גוגל ומעביר את המשתמש לדף ההתחברות של גוגל.
    // אין צורך במימוש פונקציה כאן.
  }

  @ApiOperation({ summary: 'Google Auth Callback' })
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    if (!result || !result.access_token) {
      return res.redirect('http://localhost:5173/login?error=no_token');
    }

    // הפניית המשתמש חזרה ל-Frontend עם הטוקן ב-URL Param
    res.redirect(`http://localhost:5173/auth/callback?token=${result.access_token}`);
  }
}