import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OperatorsController } from './operators.controller';
import { OperatorsService } from './operators.service';
import { UserPortal, UserPortalSchema } from '../users/schemas/user-portal.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: UserPortal.name, schema: UserPortalSchema }],
      'portal-cliente',
    ),
    AuthModule,
  ],
  controllers: [OperatorsController],
  providers: [OperatorsService],
  exports: [OperatorsService],
})
export class OperatorsModule {}
