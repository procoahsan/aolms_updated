import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateOrderAssignmentDto } from './create-order-assignment.dto';

export class UpdateOrderAssignmentDto extends PartialType(CreateOrderAssignmentDto) {}