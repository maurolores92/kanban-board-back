import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateBudgetDto {
  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsEnum(['monthly', 'yearly'])
  period!: 'monthly' | 'yearly';

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;
}
