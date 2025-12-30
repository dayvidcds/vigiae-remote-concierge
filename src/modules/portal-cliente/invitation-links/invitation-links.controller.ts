import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LinksConviteService } from './invitation-links.service';
import { CreateInvitationLinkDto } from './dto/create-invitation-link.dto';
import { RegisterVisitorViaLinkDto } from './dto/register-visitor-via-link.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/portal-cliente')
export class LinksConviteController {
  constructor(private readonly linksConviteService: LinksConviteService) {}

  // Protected endpoints (resident)
  @Post('resident/invitation-links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('resident')
  async gerar(@Request() req: any, @Body() createDto: CreateInvitationLinkDto) {
    const moradorId = req.user.userId;
    return this.linksConviteService.create(moradorId, createDto);
  }

  @Get('resident/invitation-links')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('resident')
  async listar(@Request() req: any) {
    const moradorId = req.user.userId;
    return this.linksConviteService.findAllByMorador(moradorId);
  }

  @Delete('resident/invitation-links/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('resident')
  async revogar(@Request() req: any, @Param('id') id: string) {
    const moradorId = req.user.userId;
    return this.linksConviteService.revogar(id, moradorId);
  }

  // Public endpoints (for visitor to use the link)
  @Get('invitation/:token')
  async buscarLink(@Param('token') token: string) {
    return this.linksConviteService.findByToken(token);
  }

  @Post('invitation/:token/register')
  async cadastrarVisitante(
    @Param('token') token: string,
    @Body() dto: RegisterVisitorViaLinkDto,
  ) {
    return this.linksConviteService.cadastrarVisitante(token, dto);
  }
}
