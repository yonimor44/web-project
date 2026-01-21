import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. בודק איזה תפקידים נדרשים לפונקציה הזאת (למשל 'admin')
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // אם לא הוגדר שום תפקיד מיוחד - כולם יכולים להיכנס
    if (!requiredRoles) {
      return true;
    }

    // 2. שולף את המשתמש מתוך הבקשה (ה-JwtStrategy כבר שם אותו שם)
    const { user } = context.switchToHttp().getRequest();

    // 3. בודק: האם התפקיד של המשתמש מופיע ברשימת המורשים?
    return requiredRoles.some((role) => user.role === role);
  }
}