import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  employee_code: string;

  @IsString()
  full_name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(['admin', 'controller', 'technician'])
  role: 'admin' | 'controller' | 'technician';

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}