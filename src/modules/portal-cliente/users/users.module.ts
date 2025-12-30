import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './users.service';
import {
  UserPortal,
  UserPortalSchema,
} from './schemas/user-portal.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: UserPortal.name, schema: UserPortalSchema }],
      'portal-cliente',
    ),
  ],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
