import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  UserPortal,
  UserPortalSchema,
} from '../users/schemas/user-portal.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: UserPortal.name, schema: UserPortalSchema }],
      'portal-cliente',
    ),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('portalCliente.jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('portalCliente.jwt.expiresIn'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
