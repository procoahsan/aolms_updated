import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliverySubmission } from './delivery-submissions.entity';
import { DeliverySubmissionsController } from './delivery-submissions.controller';
import { DeliverySubmissionsService } from './delivery-submissions.service';
import { BusinessRulesModule } from '../business-rules/business-rules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliverySubmission]),
    BusinessRulesModule,
  ],
  controllers: [DeliverySubmissionsController],
  providers: [DeliverySubmissionsService],
})
export class DeliverySubmissionsModule {}