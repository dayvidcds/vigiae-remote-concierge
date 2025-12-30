import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  MinLength,
  IsEnum,
  Matches,
} from 'class-validator';
import { UserType } from '../schemas/user-portal.schema';
import { PORTAL_CLIENTE_CONSTANTS } from '../../shared/constants/portal-cliente.constants';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  nome: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsEnum(UserType, { message: 'Tipo de usuário inválido' })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  tipoUsuario: UserType;

  @IsOptional()
  @IsString()
  unidade?: string;

  @IsOptional()
  @IsString()
  @Matches(PORTAL_CLIENTE_CONSTANTS.PATTERNS.TELEFONE, {
    message: 'Formato de telefone inválido. Use: (11) 98765-4321',
  })
  telefone?: string;

  @IsOptional()
  @IsString()
  cpf?: string;
}
