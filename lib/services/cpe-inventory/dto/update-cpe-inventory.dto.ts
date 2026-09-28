import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateCpeInventoryDto } from './create-cpe-inventory.dto';

export class UpdateCpeInventoryDto extends PartialType(CreateCpeInventoryDto) {}