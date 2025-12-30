import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CondominiosService } from './condominiums.service';
import { WebhooksController } from './webhooks.controller';
import { Condominium, CondominiumSchema } from './schemas/condominium.schema';
import { UsuariosModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Condominium.name, schema: CondominiumSchema }],
      'portal-cliente',
    ),
    UsuariosModule,
  ],
  controllers: [WebhooksController],
  providers: [CondominiosService],
  exports: [CondominiosService],
})
export class CondominiosModule {}
