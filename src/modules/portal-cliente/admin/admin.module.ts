import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsuariosModule } from '../users/users.module';
import { HistoricoModule } from '../access-history/access-history.module';
import { CondominiosModule } from '../condominiums/condominiums.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    UsuariosModule,
    HistoricoModule,
    CondominiosModule,
    AuthModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
