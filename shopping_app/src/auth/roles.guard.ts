import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * שומר תפקידים (Roles Guard).
 * אחראי לוודא שלמשתמש המחובר יש את ההרשאות המתאימות (למשל Admin)
 * כדי לגשת לנתיב ספציפי.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. בדיקת איזה תפקידים נדרשים לפונקציה הזו
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // אם לא הוגדרו תפקידים לנתיב זה - הגישה מותרת
    if (!requiredRoles) {
      return true;
    }

    // 2. שליפת המשתמש מהבקשה
    const { user } = context.switchToHttp().getRequest();

    // 3. בדיקה אם התפקיד קיים
    return requiredRoles.some((role) => user.role === role);
  }
}