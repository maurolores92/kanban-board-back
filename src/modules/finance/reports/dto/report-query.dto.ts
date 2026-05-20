import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class ReportQueryDto {
  @IsOptional()
  @IsEnum(['monthly', 'yearly'])
  period?: 'monthly' | 'yearly';

  @IsOptional()
  @IsNumber()
  @Min(2000)
  year?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
