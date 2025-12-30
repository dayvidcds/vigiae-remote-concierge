import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPortalDocument = UserPortal & Document;

export enum UserType {
  ADMIN = 'admin',
  RESIDENT = 'resident',
  OPERATOR = 'operator',
  TECHNICIAN = 'technician',
}

@Schema({
  timestamps: true,
  collection: 'users_portal',
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class UserPortal {
  @Prop({ type: Types.ObjectId, ref: 'Condominium', required: true })
  condominiumId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: UserType, type: String })
  userType: UserType;

  @Prop()
  unit?: string;

  @Prop()
  phone?: string;

  @Prop({ unique: true, sparse: true })
  document?: string;

  @Prop({ unique: true, required: true })
  accessCode: string;

  @Prop({ default: false })
  needsPasswordChange: boolean;

  @Prop({ type: Object })
  permissions?: {
    canViewAllCondominiums?: boolean;
    canManageVisitors?: boolean;
    canManageVehicles?: boolean;
    canViewReports?: boolean;
    canManageAccess?: boolean;
  };

  @Prop({ type: [String] })
  assignedCondominiums?: string[];

  @Prop({ default: true })
  active: boolean;

  // Automatic timestamp fields
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserPortalSchema = SchemaFactory.createForClass(UserPortal);

// Composite indexes
UserPortalSchema.index({ condominiumId: 1, email: 1 }, { unique: true });
UserPortalSchema.index({ condominiumId: 1, userType: 1 });
