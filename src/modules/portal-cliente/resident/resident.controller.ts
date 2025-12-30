import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { VisitantesService } from '../visitors/visitors.service';
import { VeiculosService } from '../vehicles/vehicles.service';
import { HistoricoService } from '../access-history/access-history.service';
import { UsuariosService } from '../users/users.service';

@Controller('api/portal-cliente/resident')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('resident')
export class MoradorController {
  constructor(
    private readonly visitantesService: VisitantesService,
    private readonly veiculosService: VeiculosService,
    private readonly historicoService: HistoricoService,
    private readonly usuariosService: UsuariosService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const userId = req.user.userId;

    const [visitantes, veiculos, acessosMes, acessosRecentes] = await Promise.all([
      this.visitantesService.findAtivos(userId),
      this.veiculosService.findAll(userId),
      this.historicoService.countAcessosMes(userId),
      this.historicoService.findByMorador(userId, { page: 1, limit: 10 }),
    ]);

    return {
      visitantesAtivos: visitantes.length,
      veiculosCadastrados: veiculos.length,
      acessosMes,
      visitantes,
      acessosRecentes: acessosRecentes.data,
    };
  }

  @Get('qrcode')
  async getQRCode(@Request() req: any) {
    const userId = req.user.userId;
    return this.usuariosService.getQRCode(userId);
  }
}
