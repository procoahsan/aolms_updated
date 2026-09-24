import { IsUUID, IsEnum, IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';
import { DeliveryStatus } from '../delivery-submissions.entity';

export class CreateDeliverySubmissionDto {
  @IsUUID()
  order_id: string;

  @IsUUID()
  technician_id: string;

  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus; // draft, submitted, locked

  @IsOptional()
  last_saved_at?: Date;

  @IsOptional()
  submitted_at?: Date;

  @IsOptional()
  edit_deadline?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  actioned?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  sub_root_cause?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  item_category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ont_protection?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  internal_wiring?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  actual_actioned_item?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  actual_actioned_sub_item?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  cable_type?: string;

  @IsOptional()
  @IsNumber()
  cable_length?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  conduit_clearance?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  conduit_pipe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  pvc_trunk?: string;

  @IsOptional()
  @IsNumber()
  total_conduit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mims_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nce_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ap1_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ap2_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ap3_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ap4_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  retrieved_cpe?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}