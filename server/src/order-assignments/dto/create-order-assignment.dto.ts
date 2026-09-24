import { IsUUID, IsNotEmpty, IsEnum, IsDateString } from 'class-validator';
import { AssignmentStatus } from '../order-assignments.entity';

export class CreateOrderAssignmentDto {
  @IsUUID()
  order_id: string;

  @IsUUID()
  technician_id: string;

  @IsUUID()
  assigned_by: string;

  @IsEnum(AssignmentStatus)
  assignment_status: AssignmentStatus;

  @IsDateString()
  assigned_at: Date;
}