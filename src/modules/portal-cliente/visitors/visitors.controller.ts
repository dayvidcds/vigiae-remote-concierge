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
import { VisitantesService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/portal-cliente/resident/visitors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('resident')
export class VisitantesController {
  constructor(private readonly visitantesService: VisitantesService) {}

  @Get()
  async listar(@Request() req: any) {
    const moradorId = req.user.userId;
    return this.visitantesService.findAll(moradorId);
  }

  @Get('active')
  async listarAtivos(@Request() req: any) {
    const moradorId = req.user.userId;
    return this.visitantesService.findAtivos(moradorId);
  }

  @Get(':id')
  async buscar(@Request() req: any, @Param('id') id: string) {
    const moradorId = req.user.userId;
    return this.visitantesService.findOne(id, moradorId);
  }

  @Post()
  async cadastrar(@Request() req: any, @Body() createDto: CreateVisitorDto) {
    const moradorId = req.user.userId;
    return this.visitantesService.create(moradorId, createDto);
  }

  @Put(':id')
  async atualizar(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateVisitorDto,
  ) {
    const moradorId = req.user.userId;
    return this.visitantesService.update(id, moradorId, updateDto);
  }

  @Delete(':id')
  async remover(@Request() req: any, @Param('id') id: string) {
    const moradorId = req.user.userId;
    return this.visitantesService.remove(id, moradorId);
  }
}
