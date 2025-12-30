import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VeiculosController } from './vehicles.controller';
import { VeiculosService } from './vehicles.service';
import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Vehicle.name, schema: VehicleSchema }],
      'portal-cliente',
    ),
    AuthModule,
  ],
  controllers: [VeiculosController],
  providers: [VeiculosService],
  exports: [VeiculosService],
})
export class VeiculosModule {}
