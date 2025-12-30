import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OperatorsService } from './operators.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { UpdateOperatorDto } from './dto/update-operator.dto';

@Controller('api/portal-cliente')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get('operators')
  @Roles('admin')
  async findAll(
    @Request() req: any,
    @Query('condominiumId') condominiumId?: string,
    @Query('userType') userType?: string,
  ) {
    const filters: any = {};
    
    if (condominiumId) {
      filters.condominiumId = condominiumId;
    } else if (req.user.userType === 'admin') {
      filters.condominiumId = req.user.condominiumId;
    }
    
    if (userType) {
      filters.userType = userType;
    }

    return this.operatorsService.findAll(filters);
  }

  @Get('operators/:id')
  @Roles('admin')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.operatorsService.findOne(id, req.user.condominiumId);
  }

  @Post('operators')
  @Roles('admin')
  async create(@Body() createOperatorDto: CreateOperatorDto, @Request() req: any) {
    return this.operatorsService.create(
      req.user.condominiumId,
      createOperatorDto,
    );
  }

  @Put('operators/:id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateOperatorDto: UpdateOperatorDto,
    @Request() req: any,
  ) {
    return this.operatorsService.update(
      id,
      req.user.condominiumId,
      updateOperatorDto,
    );
  }

  @Delete('operators/:id')
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.operatorsService.remove(id, req.user.condominiumId);
  }

  @Get('operator/dashboard')
  @Roles('operator', 'technician')
  async dashboard(@Request() req: any) {
    return this.operatorsService.getDashboard(req.user.userId);
  }

  @Get('operator/assigned-condominiums')
  @Roles('operator', 'technician')
  async getAssignedCondominiums(@Request() req: any) {
    return this.operatorsService.getAssignedCondominiums(req.user.userId);
  }
}
