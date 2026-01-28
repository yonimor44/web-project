import { Controller, Get, Post, Body, UseGuards, Request, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; 
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import type { Response } from 'express';
// --- סוואגר ---
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth') // קבוצה בתיעוד
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Return JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: LoginDto) {
    const user = await this.authService.validateUser(signInDto.email, signInDto.password);
    if (!user) {
        throw new Error('Invalid credentials'); 
    }
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Google Auth Redirect' })
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {}

  @ApiOperation({ summary: 'Google Auth Callback' })
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    if (!result || !result.access_token) {
        return res.redirect('http://localhost:5173/login?error=no_token');
    }

    res.redirect(`http://localhost:5173/auth/callback?token=${result.access_token}`);
  }
}