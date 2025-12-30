import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  PICKUP = 'pickup',
  SUV = 'suv',
  VAN = 'van',
}

@Schema({ timestamps: true, collection: 'vehicles' })
export class Vehicle {
  @Prop({ type: Types.ObjectId, ref: 'UserPortal', required: true })
  residentId: Types.ObjectId;

  @Prop({ required: true, enum: VehicleType, type: String })
  type: VehicleType;

  @Prop({ required: true, unique: true, uppercase: true })
  licensePlate: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  color: string;

  @Prop()
  year?: number;

  @Prop()
  fuel?: string;

  @Prop()
  notes?: string;

  @Prop({ default: true })
  active: boolean;

  // Auto-generated timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

// Indexes
VehicleSchema.index({ residentId: 1 });
VehicleSchema.index({ active: 1 });
