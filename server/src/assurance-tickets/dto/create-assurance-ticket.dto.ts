import { IsUUID, IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';

export class CreateAssuranceTicketDto {
  @IsUUID()
  project_id: string;

  @IsString()
  ticket_number: string;

  @IsDate()
  work_date: Date;

  @IsString()
  team: string;

  @IsUUID()
  controller_id: string;

  @IsString()
  package: string;

  @IsString()
  assurance_program: string;

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
  fault_description_from_lo: string;

  @IsString()
  mobile: string;

  @IsString()
  customer_description: string;

  @IsString()
  service_type: string;

  @IsString()
  lo_name: string;

  @IsDate()
  creation_datetime: Date;

  @IsOptional()
  @IsDate()
  assigned_datetime?: Date;

  @IsOptional()
  @IsDate()
  close_datetime?: Date;

  @IsNotEmpty()
  sla_from_creation: number;

  @IsString()
  kpi_status: string;

  @IsOptional()
  @IsString()
  reason_if_exceeded?: string;

  @IsString()
  circuit: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsUUID()
  technician_id?: string;

  @IsDate()
  created_at: Date;
}