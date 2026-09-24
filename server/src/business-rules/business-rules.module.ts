import { Module } from '@nestjs/common';
import { BusinessRulesService } from './business-rules.service';

@Module({
  providers: [BusinessRulesService],
  exports: [BusinessRulesService],
})
export class BusinessRulesModule {}