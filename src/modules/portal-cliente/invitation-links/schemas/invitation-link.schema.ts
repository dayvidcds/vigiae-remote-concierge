import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitationLinkDocument = InvitationLink & Document;

@Schema({ timestamps: true, collection: 'invitation_links' })
export class InvitationLink {
  @Prop({ type: Types.ObjectId, ref: 'UserPortal', required: true })
  residentId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, type: Date })
  visitorsValidUntil: Date;

  @Prop({ default: 'Anytime' })
  accessSchedule: string;

  @Prop({ default: 5 })
  maxVisitors: number;

  @Prop({ default: 0 })
  registeredVisitors: number;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ default: false })
  revoked: boolean;

  // Auto-generated timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const InvitationLinkSchema = SchemaFactory.createForClass(InvitationLink);

// Indexes
InvitationLinkSchema.index({ residentId: 1 });
InvitationLinkSchema.index({ token: 1 });
InvitationLinkSchema.index({ revoked: 1 });
