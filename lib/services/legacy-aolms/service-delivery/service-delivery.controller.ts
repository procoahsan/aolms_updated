import 'server-only';

import { ServiceDeliveryService } from './service-delivery.service';






export class ServiceDeliveryController {
 constructor(private readonly service:ServiceDeliveryService) {}
  async status(){return {success:true,data:await this.service.getStatus()};}
  async records(){return {success:true,data:await this.service.records()};}
  async date( date:string){return {success:true,data:await this.service.changeDate(date)};}
  async verify( date?:string){return {success:true,data:await this.service.dataVerification(date)};}
  async ont( date?:string){return {success:true,data:await this.service.crossVerifyOntCheck(date)};}
  async final(){return {success:true,data:await this.service.finalOutput()};}
}
