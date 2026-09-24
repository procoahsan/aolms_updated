import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderAssignmentDto } from './create-order-assignment.dto';

export class UpdateOrderAssignmentDto extends PartialType(CreateOrderAssignmentDto) {}