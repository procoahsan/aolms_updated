import 'server-only';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  full_name: string;

  @IsString()
  employee_code: string;

  @IsEnum(['admin', 'controller', 'technician'])
  role: 'admin' | 'controller' | 'technician';

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
