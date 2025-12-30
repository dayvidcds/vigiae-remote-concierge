import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CondominiosService } from './condominiums.service';
import { UsuariosService } from '../users/users.service';
import { UserType } from '../users/schemas/user-portal.schema';

@Controller('api/portal-cliente/webhooks')
export class WebhooksController {
  constructor(
    private readonly condominiosService: CondominiosService,
    private readonly usuariosService: UsuariosService,
    private readonly configService: ConfigService,
  ) {}

  private validateWebhookSecret(secret: string): void {
    const expectedSecret = this.configService.get<string>('portalCliente.webhook.secret');

    if (secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
  }

  @Post('condominium-created')
  async condominiumCreated(@Headers('x-webhook-secret') secret: string, @Body() data: any) {
    this.validateWebhookSecret(secret);

    const condominium = await this.condominiosService.createOrUpdate(data);

    return {
      success: true,
      condominiumId: condominium._id,
    };
  }

  @Post('condominium-updated')
  async condominiumUpdated(@Headers('x-webhook-secret') secret: string, @Body() data: any) {
    this.validateWebhookSecret(secret);

    const condominium = await this.condominiosService.createOrUpdate(data);

    return {
      success: true,
      condominiumId: condominium._id,
    };
  }

  @Post('condominium-deactivated')
  async condominiumDeactivated(
    @Headers('x-webhook-secret') secret: string,
    @Body() data: { condominiumId: string },
  ) {
    this.validateWebhookSecret(secret);

    await this.condominiosService.deactivate(data.condominiumId);

    return {
      success: true,
    };
  }

  @Post('admin-created')
  async adminCreated(@Headers('x-webhook-secret') secret: string, @Body() data: any) {
    this.validateWebhookSecret(secret);

    const { condominiumId, name, email, temporaryPassword, needsPasswordChange } = data;

    const admin = await this.usuariosService.create(condominiumId, {
      nome: name,
      email,
      senha: temporaryPassword,
      tipoUsuario: UserType.ADMIN,
    });

    if (needsPasswordChange) {
      admin.needsPasswordChange = true;
      await admin.save();
    }

    return {
      success: true,
      adminId: admin._id,
    };
  }

  @Post('operator-created')
  async operatorCreated(@Headers('x-webhook-secret') secret: string, @Body() data: any) {
    this.validateWebhookSecret(secret);

    const { 
      condominiumId, 
      name, 
      email, 
      temporaryPassword, 
      role, 
      permissions,
      assignedCondominiums,
      needsPasswordChange 
    } = data;

    const operator = await this.usuariosService.create(condominiumId, {
      nome: name,
      email,
      senha: temporaryPassword,
      tipoUsuario: role, // 'operator' or 'technician'
    });

    if (permissions) {
      operator.permissions = permissions;
    }

    if (assignedCondominiums && assignedCondominiums.length > 0) {
      operator.assignedCondominiums = assignedCondominiums;
    }

    if (needsPasswordChange) {
      operator.needsPasswordChange = true;
    }

    await operator.save();

    return {
      success: true,
      operatorId: operator._id,
    };
  }

  @Post('operator-updated')
  async operatorUpdated(@Headers('x-webhook-secret') secret: string, @Body() data: any) {
    this.validateWebhookSecret(secret);

    const { operatorId, name, email, permissions, assignedCondominiums, ativo } = data;

    const updateData: any = {};
    if (name) updateData.nome = name;
    if (email) updateData.email = email;
    if (permissions) updateData.permissions = permissions;
    if (assignedCondominiums) updateData.assignedCondominiums = assignedCondominiums;
    if (ativo !== undefined) updateData.ativo = ativo;

    await this.usuariosService.update(operatorId, updateData);

    return {
      success: true,
    };
  }

  @Post('operator-deactivated')
  async operatorDeactivated(@Headers('x-webhook-secret') secret: string, @Body() data: any) {
    this.validateWebhookSecret(secret);

    await this.usuariosService.remove(data.operatorId);

    return {
      success: true,
    };
  }
}
