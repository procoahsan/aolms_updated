import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssuranceSubmission } from './assurance-submissions.entity';
import { AssuranceSubmissionsController } from './assurance-submissions.controller';
import { AssuranceSubmissionsService } from './assurance-submissions.service';
import { BusinessRulesModule } from '../business-rules/business-rules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssuranceSubmission]),
    BusinessRulesModule,
  ],
  controllers: [AssuranceSubmissionsController],
  providers: [AssuranceSubmissionsService],
})
export class AssuranceSubmissionsModule {}