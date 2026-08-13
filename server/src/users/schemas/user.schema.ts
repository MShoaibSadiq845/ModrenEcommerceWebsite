import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'User',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin',
}

export class ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, enum: Object.values(UserRole), default: UserRole.USER })
  role: UserRole;

  @Prop({ type: Number, default: 0 })
  loyaltyPoints: number;

  @Prop({ type: String, default: '' })
  avatar: string;

  @Prop({ type: String, default: '' })
  phone: string;

  // Saved shipping address — persisted to DB so user doesn't retype every order
  @Prop({
    type: {
      fullName: { type: String, default: '' },
      phone:    { type: String, default: '' },
      street:   { type: String, default: '' },
      city:     { type: String, default: '' },
      state:    { type: String, default: '' },
      postalCode:{ type: String, default: '' },
      country:  { type: String, default: '' },
    },
    default: {},
  })
  shippingAddress: ShippingAddress;
}

export const UserSchema = SchemaFactory.createForClass(User);
