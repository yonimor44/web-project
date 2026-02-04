import { 
  Injectable, 
  NestInterceptor, 
  ExecutionContext, 
  CallHandler, 
  Logger 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * אינטרספטור לתיעוד (Logging Interceptor).
 * נכנס לפעולה לפני ואחרי כל בקשה לשרת.
 * מודד כמה זמן לקח לשרת לעבד את הבקשה ומדפיס לוג מסודר.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    
    // חילוץ פרטי הבקשה
    const method = request.method;
    const url = request.url;
    
    // שמירת זמן ההתחלה
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => {
          // הקוד כאן רץ *אחרי* שהבקשה טופלה
          const response = ctx.getResponse();
          const statusCode = response.statusCode;
          const delay = Date.now() - now; // חישוב הזמן שעבר
          
          // הדפסה ללוג בתבנית: [METHOD] URL STATUS - DURATION
          // דוגמה: POST /api/auth/login 201 - 150ms
          this.logger.log(
            `${method} ${url} ${statusCode} - ${delay}ms`,
          );
        }),
      );
  }
}