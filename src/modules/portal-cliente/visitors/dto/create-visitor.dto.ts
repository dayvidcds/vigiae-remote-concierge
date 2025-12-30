import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVisitorDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Documento é obrigatório' })
  documento: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsDate({ message: 'Data de validade inválida' })
  @IsNotEmpty({ message: 'Data de validade é obrigatória' })
  @Type(() => Date)
  dataValidade: Date;

  @IsOptional()
  @IsString()
  horarioAcesso?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
