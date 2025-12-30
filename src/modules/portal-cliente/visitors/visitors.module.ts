import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VisitantesController } from './visitors.controller';
import { VisitantesService } from './visitors.service';
import { Visitor, VisitorSchema } from './schemas/visitor.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Visitor.name, schema: VisitorSchema }],
      'portal-cliente',
    ),
    AuthModule,
  ],
  controllers: [VisitantesController],
  providers: [VisitantesService],
  exports: [VisitantesService],
})
export class VisitantesModule {}
