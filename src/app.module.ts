import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PortalClienteModule } from './modules/portal-cliente/portal-cliente.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 🎯 Módulo Portal do Cliente (isolado e portável)
    PortalClienteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
