import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}