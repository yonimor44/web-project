import { Controller, Get, Post, Patch, Put, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- הרשמה (פתוח לכולם) ---
  @Post() 
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // --- קבלת פרופיל אישי (רק למשתמש מחובר) ---
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    // בדיקה כפולה: או id או userId
    const id = req.user.id || req.user.userId;
    return this.usersService.findOneById(id);
  }

  // --- עדכון פרופיל אישי (שם, כתובת וכו') ---
  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  updateProfile(@Request() req, @Body() body: any) {
      const id = req.user.id || req.user.userId;
      return this.usersService.updateProfile(id, body);
  }

  // --- שינוי סיסמה ---
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  changePassword(@Request() req, @Body() body: any) {
      // 1. חילוץ ה-ID בצורה בטוחה
      const userId = req.user.id || req.user.userId;

      console.log('DEBUG CONTROLLER: Change Password Request');
      console.log('DEBUG CONTROLLER: User form Token:', req.user);
      console.log('DEBUG CONTROLLER: Extracted ID:', userId);

      if (!userId) {
          throw new BadRequestException('User ID not found in token');
      }

      return this.usersService.changePassword(+userId, body.currentPassword, body.newPassword);
  }

  // --- קבלת כל המשתמשים (רק לאדמין) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get() // GET /users
  findAll() {
    return this.usersService.findAll();
  }

  // --- עדכון תפקיד משתמש (רק לאדמין) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/role') // PATCH /users/123/role
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(+id, role);
  }
}