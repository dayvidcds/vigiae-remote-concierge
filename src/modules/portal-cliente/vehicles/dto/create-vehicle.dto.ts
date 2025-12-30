import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { VehicleType } from '../schemas/vehicle.schema';
import { PORTAL_CLIENTE_CONSTANTS } from '../../shared/constants/portal-cliente.constants';

export class CreateVehicleDto {
  @IsEnum(VehicleType, { message: 'Tipo de veículo inválido' })
  @IsNotEmpty({ message: 'Tipo de veículo é obrigatório' })
  tipo: VehicleType;

  @IsString()
  @IsNotEmpty({ message: 'Placa é obrigatória' })
  placa: string;

  @IsString()
  @IsNotEmpty({ message: 'Marca é obrigatória' })
  marca: string;

  @IsString()
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  modelo: string;

  @IsString()
  @IsNotEmpty({ message: 'Cor é obrigatória' })
  cor: string;

  @IsOptional()
  @IsNumber()
  @Min(1900, { message: 'Ano inválido' })
  @Max(new Date().getFullYear() + 1, { message: 'Ano inválido' })
  ano?: number;

  @IsOptional()
  @IsString()
  combustivel?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
