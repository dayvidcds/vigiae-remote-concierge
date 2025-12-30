import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoricoController } from './access-history.controller';
import { HistoricoService } from './access-history.service';
import {
  AccessHistory,
  AccessHistorySchema,
} from './schemas/access-history.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: AccessHistory.name, schema: AccessHistorySchema }],
      'portal-cliente',
    ),
    AuthModule,
  ],
  controllers: [HistoricoController],
  providers: [HistoricoService],
  exports: [HistoricoService],
})
export class HistoricoModule {}
