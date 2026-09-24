import { PartialType } from '@nestjs/mapped-types';
import { CreateCpeInventoryDto } from './create-cpe-inventory.dto';

export class UpdateCpeInventoryDto extends PartialType(CreateCpeInventoryDto) {}