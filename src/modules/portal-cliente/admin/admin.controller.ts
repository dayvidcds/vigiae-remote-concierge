import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CondominiosService } from '../condominiums/condominiums.service';
import { HistoricoService } from '../access-history/access-history.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UserType } from '../users/schemas/user-portal.schema';
import { UsuariosService } from '../users/users.service';

@Controller('api/portal-cliente/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly historicoService: HistoricoService,
    private readonly condominiosService: CondominiosService,
  ) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    const condominioId = req.user.condominioId;

    const [condominium, estatisticas, acessosRecentes] = await Promise.all([
      this.condominiosService.findOne(condominioId),
      this.historicoService.getEstatisticasCondominio(condominioId),
      this.historicoService.getAcessosRecentes(condominioId, 20),
    ]);

    const { data: moradores } = await this.usuariosService.findAll(
      condominioId,
      { page: 1, limit: 1000 },
      undefined,
      UserType.RESIDENT,
    );

    return {
      estatisticas: {
        totalMoradores: moradores.length,
        acessosHoje: estatisticas.acessosHoje,
        acessosMes: estatisticas.acessosMes,
      },
      acessosRecentes,
      condominium: {
        nome: condominium.name,
        endereco: condominium.address,
      },
    };
  }

  @Get('residents')
  async listarMoradores(
    @Request() req: any,
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
  ) {
    const condominioId = req.user.condominioId;
    return this.usuariosService.findAll(condominioId, paginationDto, search, UserType.RESIDENT);
  }

  @Get('residents/:id')
  async buscarMorador(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Post('residents')
  async cadastrarMorador(@Request() req: any, @Body() createDto: CreateUserDto) {
    const condominioId = req.user.condominioId;

    // Force resident type
    createDto.tipoUsuario = UserType.RESIDENT;
    return this.usuariosService.create(condominioId, createDto);
  }

  @Put('residents/:id')
  async atualizarMorador(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.usuariosService.update(id, updateDto);
  }

  @Delete('residents/:id')
  async desativarMorador(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
}
