import { Module } from '@nestjs/common';
import { NotificacoesService } from './notifications.service';

@Module({
  providers: [NotificacoesService],
  exports: [NotificacoesService],
})
export class NotificacoesModule {}
