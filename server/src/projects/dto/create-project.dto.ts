import { IsString, IsBoolean, IsOptional, IsInt, Min } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}
