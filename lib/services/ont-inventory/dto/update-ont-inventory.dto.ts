import 'server-only';
import { PartialType } from '@/lib/validation';
import { CreateOntInventoryDto } from './create-ont-inventory.dto';

export class UpdateOntInventoryDto extends PartialType(CreateOntInventoryDto) {}