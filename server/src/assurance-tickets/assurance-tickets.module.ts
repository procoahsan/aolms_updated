import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssuranceTicket } from './assurance-tickets.entity';
import { AssuranceTicketsController } from './assurance-tickets.controller';
import { AssuranceTicketsService } from './assurance-tickets.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssuranceTicket])],
  controllers: [AssuranceTicketsController],
  providers: [AssuranceTicketsService],
})
export class AssuranceTicketsModule {}