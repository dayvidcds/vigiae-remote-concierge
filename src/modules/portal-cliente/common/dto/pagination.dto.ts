import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Página deve ser um número positivo' })
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Limite deve ser um número positivo' })
  @Min(1)
  @Max(100, { message: 'Limite máximo é 100' })
  limit?: number = 20;
}
