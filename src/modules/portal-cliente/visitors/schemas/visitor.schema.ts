import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VisitorDocument = Visitor & Document;

@Schema({ timestamps: true, collection: 'visitors' })
export class Visitor {
  @Prop({ type: Types.ObjectId, ref: 'UserPortal', required: true })
  residentId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  document: string;

  @Prop()
  phone?: string;

  @Prop({ required: true, type: Date })
  validUntil: Date;

  @Prop({ default: 'Anytime' })
  accessSchedule: string;

  @Prop()
  notes?: string;

  @Prop({ default: false })
  registeredViaLink: boolean;

  @Prop({ type: Types.ObjectId, ref: 'InvitationLink' })
  invitationLinkId?: Types.ObjectId;

  @Prop({ default: true })
  active: boolean;

  // Auto-generated timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const VisitorSchema = SchemaFactory.createForClass(Visitor);

// Indexes
VisitorSchema.index({ residentId: 1 });
VisitorSchema.index({ validUntil: 1 });
VisitorSchema.index({ active: 1 });
VisitorSchema.index({ document: 1 });
