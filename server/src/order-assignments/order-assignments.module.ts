import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderAssignment } from './order-assignments.entity';
import { OrderAssignmentsController } from './order-assignments.controller';
import { OrderAssignmentsService } from './order-assignments.service';

@Module({
  imports: [TypeOrmModule.forFeature([OrderAssignment])],
  controllers: [OrderAssignmentsController],
  providers: [OrderAssignmentsService],
})
export class OrderAssignmentsModule {}