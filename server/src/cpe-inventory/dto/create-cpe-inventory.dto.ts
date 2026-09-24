import { IsUUID, IsString, IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreateCpeInventoryDto {
  @IsUUID()
  project_id: string;

  @IsString()
  order_number: string;

  @IsDate()
  installation_date: Date;

  @IsString()
  exchange: string;

  @IsString()
  block: string;

  @IsString()
  road: string;

  @IsString()
  building: string;

  @IsString()
  flat: string;

  @IsString()
  asset_description: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  po_number?: string;

  @IsString()
  serial_number: string;

  @IsString()
  contractor: string;

  @IsString()
  connection_type: string;

  @IsString()
  lo_name: string;

  @IsNumber()
  labor_charge: number;

  @IsNumber()
  cpe_charge: number;

  @IsNumber()
  source_year: number;

  @IsString()
  source_sheet: string;
}