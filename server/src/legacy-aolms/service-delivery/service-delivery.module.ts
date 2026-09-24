import { Module } from '@nestjs/common';
import { ServiceDeliveryController } from './service-delivery.controller';
import { ServiceDeliveryService } from './service-delivery.service';

@Module({
  controllers: [ServiceDeliveryController],
  providers: [ServiceDeliveryService],
  exports: [ServiceDeliveryService],
})
export class ServiceDeliveryModule {}
