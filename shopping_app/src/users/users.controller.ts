import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    return req.user;
  }

  // --- קבלת כל המשתמשים (רק לאדמין) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get() // GET /users
  findAll() {
    return this.usersService.findAll();
  }

  // --- חדש: עדכון תפקיד משתמש (רק לאדמין) ---
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/role') // PATCH /users/123/role
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(+id, role);
  }
}