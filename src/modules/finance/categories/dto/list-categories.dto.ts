import { IsEnum, IsOptional } from 'class-validator';

export class ListCategoriesDto {
  @IsOptional()
  @IsEnum(['income', 'expense'])
  type?: 'income' | 'expense';
}
