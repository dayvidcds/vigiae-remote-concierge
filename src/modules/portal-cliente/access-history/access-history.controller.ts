import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { HistoricoService, HistoricoFilter } from './access-history.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/portal-cliente')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistoricoController {
  constructor(private readonly historicoService: HistoricoService) {}

  @Get('resident/history')
  @Roles('resident')
  async getMoradorHistorico(
    @Request() req: any,
    @Query() paginationDto: PaginationDto,
    @Query() filter: HistoricoFilter,
  ) {
    const moradorId = req.user.userId;
    return this.historicoService.findByMorador(
      moradorId,
      paginationDto,
      filter,
    );
  }

  @Get('admin/history')
  @Roles('admin')
  async getCondominioHistorico(
    @Request() req: any,
    @Query() paginationDto: PaginationDto,
    @Query() filter: HistoricoFilter,
  ) {
    const condominioId = req.user.condominioId;
    return this.historicoService.findByCondominio(
      condominioId,
      paginationDto,
      filter,
    );
  }
}
