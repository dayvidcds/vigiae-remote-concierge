import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccessHistoryDocument = AccessHistory & Document;

export enum PersonType {
  RESIDENT = 'resident',
  VISITOR = 'visitor',
  SERVICE_PROVIDER = 'service_provider',
}

export enum AccessType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

export enum AccessMethod {
  QRCODE = 'qrcode',
  BIOMETRIC = 'biometric',
  MANUAL = 'manual',
  TAG = 'tag',
}

@Schema({ timestamps: true, collection: 'access_history' })
export class AccessHistory {
  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserPortal' })
  residentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Visitor' })
  visitorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicleId?: Types.ObjectId;

  @Prop({ required: true, enum: PersonType, type: String })
  personType: PersonType;

  @Prop({ required: true, enum: AccessType, type: String })
  accessType: AccessType;

  @Prop({ required: true })
  accessPoint: string;

  @Prop({ default: AccessMethod.MANUAL, enum: AccessMethod, type: String })
  accessMethod: AccessMethod;

  @Prop()
  cameraId?: string;

  @Prop()
  photoUrl?: string;

  @Prop()
  notes?: string;

  @Prop({ default: Date.now, type: Date })
  timestamp: Date;

  // Auto-generated timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const AccessHistorySchema = SchemaFactory.createForClass(AccessHistory);

// Indexes
AccessHistorySchema.index({ condominiumId: 1 });
AccessHistorySchema.index({ residentId: 1 });
AccessHistorySchema.index({ visitorId: 1 });
AccessHistorySchema.index({ timestamp: -1 });
AccessHistorySchema.index({ personType: 1 });
AccessHistorySchema.index({ accessType: 1 });
AccessHistorySchema.index({ condominiumId: 1, timestamp: -1 });
