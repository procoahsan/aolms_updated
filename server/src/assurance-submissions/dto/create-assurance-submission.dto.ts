import { IsUUID, IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber, MaxLength, IsBoolean } from 'class-validator';
import { AssuranceSubmissionStatus } from '../assurance-submissions.entity';

export class CreateAssuranceSubmissionDto {
  @IsUUID()
  ticket_id: string;

  @IsUUID()
  technician_id: string;

  @IsOptional()
  @IsEnum(AssuranceSubmissionStatus)
  status?: AssuranceSubmissionStatus; // draft, submitted, locked

  @IsOptional()
  last_saved_at?: Date;

  @IsOptional()
  submitted_at?: Date;

  @IsOptional()
  edit_deadline?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  root_cause?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  resolution?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  resolution_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mims?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  replacement_reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  replaced_cpe_model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  replaced_cpe_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  new_cpe_model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  new_cpe_sn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ont_protection_box?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  saas_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  box_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  replacement?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  saas_non_saas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  physical_verification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsBoolean()
  closed?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}