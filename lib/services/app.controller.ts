import 'server-only';

import { AppService } from './app.service.js';


export class AppController {
  constructor(private readonly appService: AppService) {}

  
  getHello(): string {
    return this.appService.getHello();
  }
}
