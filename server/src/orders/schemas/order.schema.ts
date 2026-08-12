import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Product } from '../../products/schemas/product.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELED = 'Canceled',
}

@Schema()
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Product;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number, default: 0 })
  pointsPrice: number;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, default: 'currency' })
  paymentMethod: string;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Number, required: true, default: 0 })
  totalAmount: number;

  @Prop({ type: Number, default: 0 })
  pointsEarned: number;

  @Prop({ type: Number, default: 0 })
  pointsUsed: number;

  @Prop({ type: String, enum: Object.values(OrderStatus), default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({
    type: {
      street: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    default: {
      street: '123 Main St',
      city: 'New York',
      postalCode: '10001',
      country: 'USA',
    },
  })
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export const OrderSchema = SchemaFactory.createForClass(Order);
