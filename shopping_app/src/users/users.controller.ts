import { Controller, Get, Post, Patch, Put, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

/**
 * בקר (Controller) לניהול משתמשים.
 * חושף נתיבי API לרישום, עדכון פרופיל וניהול משתמשים (Admin).
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

 // רישום משתמש חדש (פתוח לכולם)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

 // שליפת פרטי הפרופיל של המשתמש המחובר
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    // תמיכה בשני סוגי payload (תלוי איך נבנה ה-strategy)
    const id = req.user.id || req.user.userId;
    return this.usersService.findOneById(id);
  }

  // עדכון פרטי הפרופיל של המשתמש המחובר
  @UseGuards(AuthGuard('jwt'))
  @Put('profile')
  updateProfile(@Request() req, @Body() body: any) {
    const id = req.user.id || req.user.userId;
    return this.usersService.updateProfile(id, body);
  }

  // שינוי סיסמה למשתמש המחובר
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  changePassword(@Request() req, @Body() body: any) {
    const userId = req.user.id || req.user.userId;

    if (!userId) {
      throw new BadRequestException('User ID not found in token context');
    }

    return this.usersService.changePassword(
      +userId,
      body.currentPassword,
      body.newPassword
    );
  }

 // שליפת כל המשתמשים (Admin בלבד)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

// עדכון תפקיד משתמש (Admin בלבד)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(+id, role);
  }
}