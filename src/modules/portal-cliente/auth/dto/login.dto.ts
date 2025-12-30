import {
  IsEmail,
  IsString,
  IsEnum,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @IsEnum(['admin', 'morador', 'operator', 'technician'], { 
    message: 'Tipo de usuário inválido. Tipos válidos: admin, morador, operator, technician' 
  })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  tipoUsuario: 'admin' | 'morador' | 'operator' | 'technician';
}
