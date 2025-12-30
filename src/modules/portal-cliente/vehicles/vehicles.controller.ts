import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VeiculosService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/portal-cliente/resident/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('resident')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Get()
  async listar(@Request() req: any) {
    const moradorId = req.user.userId;
    return this.veiculosService.findAll(moradorId);
  }

  @Get(':id')
  async buscar(@Request() req: any, @Param('id') id: string) {
    const moradorId = req.user.userId;
    return this.veiculosService.findOne(id, moradorId);
  }

  @Post()
  async cadastrar(@Request() req: any, @Body() createDto: CreateVehicleDto) {
    const moradorId = req.user.userId;
    return this.veiculosService.create(moradorId, createDto);
  }

  @Put(':id')
  async atualizar(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateVehicleDto,
  ) {
    const moradorId = req.user.userId;
    return this.veiculosService.update(id, moradorId, updateDto);
  }

  @Delete(':id')
  async remover(@Request() req: any, @Param('id') id: string) {
    const moradorId = req.user.userId;
    return this.veiculosService.remove(id, moradorId);
  }
}
