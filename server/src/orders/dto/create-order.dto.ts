import { IsUUID, IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  project_id: string;

  @IsDate()
  work_date: Date;

  @IsString()
  team: string;

  @IsString()
  exchange: string;

  @IsString()
  order_number: string;

  @IsString()
  contact: string;

  @IsString()
  lo: string;

  @IsString()
  service_identifier: string;

  @IsString()
  order_type: string;

  @IsString()
  block: string;

  @IsString()
  road: string;

  @IsString()
  building: string;

  @IsString()
  flat: string;

  @IsString()
  slot: string;

  @IsString()
  package: string;

  @IsString()
  cpr_cr: string;

  @IsString()
  controller_remarks: string;

  @IsString()
  appointment: string;

  @IsDate()
  task_created_at: Date;

  @IsDate()
  order_created_at: Date;

  @IsString()
  connection_type: string;

  @IsString()
  fttr_type: string;

  @IsString()
  action: string;

  @IsString()
  sub_root_cause: string;

  @IsString()
  item_category: string;

  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @IsUUID()
  created_by: string;
}