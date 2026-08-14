import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactDocument = Contact & Document;

export enum ContactStatus {
  UNREAD  = 'unread',
  READ    = 'read',
  REPLIED = 'replied',
}

@Schema({ timestamps: true })
export class Contact {
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ type: String, required: true, trim: true })
  subject: string;

  @Prop({ type: String, required: true, trim: true })
  message: string;

  @Prop({ type: String, enum: Object.values(ContactStatus), default: ContactStatus.UNREAD })
  status: ContactStatus;

  @Prop({ type: String, default: '' })
  adminReply: string;

  @Prop({ type: Date })
  repliedAt?: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
