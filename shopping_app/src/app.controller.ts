import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
 @Get('health')
getHealth() {
  // שבירה מכוונת לצורך בדיקת Rollback
  throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
}
}
