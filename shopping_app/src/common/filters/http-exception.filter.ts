import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * פילטר שגיאות גלובלי (Global Exception Filter).
 * תפקידו לתפוס כל שגיאה שנזרקת באפליקציה, לתעד אותה בלוג,
 * ולהחזיר לקליינט תשובת JSON אחידה ומסודרת.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * הפונקציה שתופסת את השגיאה ומעבדת אותה.
   * @param exception - השגיאה שנזרקה
   * @param host - הקונטקסט של הבקשה (גישה ל-Request/Response)
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // קביעת הסטטוס (אם זו שגיאת HTTP מוכרת או שגיאת שרת כללית 500)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // חילוץ הודעת השגיאה
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    // תיעוד השגיאה בטרמינל (חשוב לניפוי באגים)
    this.logger.error(
      `Http Status: ${status} Error Message: ${JSON.stringify(message)}`,
    );

    // החזרת התשובה המעוצבת לקליינט
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}