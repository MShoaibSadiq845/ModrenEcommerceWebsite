import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, default: 'sale' })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({ type: String })
  link?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
