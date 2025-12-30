import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';

// Configurações
import { portalClienteConfig } from './config/portal-cliente.config';

// Módulos internos
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { MoradorModule } from './resident/resident.module';
import { VisitantesModule } from './visitors/visitors.module';
import { VeiculosModule } from './vehicles/vehicles.module';
import { LinksConviteModule } from './invitation-links/invitation-links.module';
import { HistoricoModule } from './access-history/access-history.module';
import { UsuariosModule } from './users/users.module';
import { CondominiosModule } from './condominiums/condominiums.module';
import { NotificacoesModule } from './notifications/notifications.module';
import { OperatorsModule } from './operators/operators.module';

/**
 * 🎯 MÓDULO PORTAL DO CLIENTE
 * 
 * Este módulo é completamente isolado e pode ser extraído
 * para um projeto separado no futuro.
 * 
 * IMPORTANTE:
 * - Não importar módulos externos do sistema principal
 * - Todas as dependências devem estar dentro deste módulo
 * - Configurações via ConfigModule (externalizadas)
 * - Database pode usar conexão separada (opcional)
 */
@Module({
  imports: [
    // Configuração isolada do módulo
    ConfigModule.forRoot({
      load: [portalClienteConfig],
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database connection (conexão dedicada para o Portal Cliente)
    MongooseModule.forRootAsync({
      connectionName: 'portal-cliente',
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('portalCliente.database.uri'),
      }),
      inject: [ConfigService],
    }),

    // Cache isolado
    NestCacheModule.register({
      isGlobal: true,
      ttl: 3600, // TTL padrão: 1 hora (em segundos)
      max: 100, // Máximo de itens em cache
    }),

    // Agendamento de tarefas (para expiração de links, etc)
    ScheduleModule.forRoot(),

    // Submódulos do Portal do Cliente
    AuthModule,
    AdminModule,
    MoradorModule,
    VisitantesModule,
    VeiculosModule,
    LinksConviteModule,
    HistoricoModule,
    UsuariosModule,
    CondominiosModule,
    NotificacoesModule,
    OperatorsModule,
  ],
  controllers: [],
  providers: [],
  exports: [
    // Exportar apenas o necessário para integração externa
    HistoricoModule,
    NotificacoesModule,
  ],
})
export class PortalClienteModule {}
