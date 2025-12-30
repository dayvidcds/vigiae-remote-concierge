import { Module } from '@nestjs/common';
import { MoradorController } from './resident.controller';
import { VisitantesModule } from '../visitors/visitors.module';
import { VeiculosModule } from '../vehicles/vehicles.module';
import { HistoricoModule } from '../access-history/access-history.module';
import { UsuariosModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    VisitantesModule,
    VeiculosModule,
    HistoricoModule,
    UsuariosModule,
    AuthModule,
  ],
  controllers: [MoradorController],
})
export class MoradorModule {}
