import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PORTAL_CLIENTE_CONSTANTS } from '../../shared/constants/portal-cliente.constants';

export class CreateInvitationLinkDto {
  @IsDate({ message: 'Data de validade dos visitantes inválida' })
  @IsNotEmpty({ message: 'Data de validade dos visitantes é obrigatória' })
  @Type(() => Date)
  validadeVisitantes: Date;

  @IsOptional()
  @IsString()
  horarioAcesso?: string;

  @IsOptional()
  @IsNumber()
  @Min(PORTAL_CLIENTE_CONSTANTS.LIMITES.MIN_VISITANTES_POR_LINK, {
    message: 'Mínimo de 1 visitante',
  })
  @Max(PORTAL_CLIENTE_CONSTANTS.LIMITES.MAX_VISITANTES_POR_LINK, {
    message: `Máximo de ${PORTAL_CLIENTE_CONSTANTS.LIMITES.MAX_VISITANTES_POR_LINK} visitantes`,
  })
  maxVisitantes?: number;
}
