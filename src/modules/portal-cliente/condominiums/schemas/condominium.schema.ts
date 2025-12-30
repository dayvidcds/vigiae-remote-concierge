import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CondominiumDocument = Condominium & Document;

@Schema({ timestamps: true, collection: 'condominiums' })
export class Condominium {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  taxId: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ type: Object })
  limits?: {
    residents?: number;
    visitors?: number;
    vehicles?: number;
  };

  @Prop({ type: Object })
  settings?: {
    requireVisitorApproval?: boolean;
    invitationLinkEnabled?: boolean;
    qrCodeEnabled?: boolean;
  };

  @Prop({ default: true })
  active: boolean;

  // Automatic timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const CondominiumSchema = SchemaFactory.createForClass(Condominium);

// Indexes
CondominiumSchema.index({ active: 1 });
