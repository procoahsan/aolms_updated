import { IsString, IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateOntInventoryDto {
  @IsString()
  item_code: string;

  @IsDate()
  receiving_date: Date;

  @IsOptional()
  @IsString()
  reservation_number?: string;

  @IsString()
  serial_number: string;

  @IsNumber()
  quantity: number;

  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  po_number?: string;

  @IsString()
  ont_type: string;

  @IsString()
  source_sheet: string;

  @IsString()
  status: string;
}