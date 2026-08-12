import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  buyerId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  lotNumber: string;

  @Prop({ type: Date, required: true })
  winDate: Date;

  @Prop({ type: String, default: 'ready_for_shipping', enum: ['ready_for_shipping', 'in_transit', 'delivered'] })
  shippingStatus: string;

  @Prop({ type: String, required: true })
  transactionId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);