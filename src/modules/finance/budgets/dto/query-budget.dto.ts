import { IsDateString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class QueryBudgetDto {
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsOptional()
  @IsEnum(['monthly', 'yearly'])
  period?: 'monthly' | 'yearly';

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
