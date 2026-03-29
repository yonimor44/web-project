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
  checkHealth() {
    return 'OK'; 
    // ב-NestJS, ברגע שאתה מחזיר תשובה רגילה מ-Get, הוא אוטומטית שולח סטטוס 200 שזה בדיוק מה שקוברנטיס מחפש.
  }
}
