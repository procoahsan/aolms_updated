import { PartialType } from '@nestjs/mapped-types';
import { CreateOntInventoryDto } from './create-ont-inventory.dto';

export class UpdateOntInventoryDto extends PartialType(CreateOntInventoryDto) {}