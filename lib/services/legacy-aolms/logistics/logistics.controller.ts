import 'server-only';

import { LogisticsService } from './logistics.service';






export class LogisticsController {
 constructor(private readonly service:LogisticsService) {}
  records(){return this.service.records();}
  date( date:string){return this.service.changeDate(date);}
  async ont( date?:string){return {success:true,data:await this.service.checkOntSerials(date)};}
}
