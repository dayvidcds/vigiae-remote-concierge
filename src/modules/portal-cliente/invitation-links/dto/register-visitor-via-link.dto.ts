import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterVisitorViaLinkDto {
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
}
