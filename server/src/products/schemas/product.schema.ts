import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

export enum PurchaseType {
  REGULAR = 'regular',
  LOYALTY_ONLY = 'loyalty_only',
  HYBRID = 'hybrid',
}

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Boolean, default: true })
  verified: boolean;

  @Prop({ type: String, required: false })
  user?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Number, default: 0 })
  salePrice: number;

  @Prop({ type: Boolean, default: false })
  isOnSale: boolean;

  @Prop({ type: String, enum: Object.values(PurchaseType), default: PurchaseType.REGULAR })
  purchaseType: PurchaseType;

  @Prop({ type: Number, default: 0 })
  pointsPrice: number;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: String, required: true })
  brand: string;

  @Prop({ type: String, required: false })
  color?: string;

  @Prop({ type: String, required: false })
  size?: string;

  @Prop({ type: Number, required: true, default: 0 })
  stock: number;

  @Prop({ type: String, required: true, unique: true })
  sku: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [ReviewSchema], default: [] })
  reviews: Review[];

  @Prop({ type: Number, default: 4.5 })
  rating: number;

  @Prop({ type: Number, default: 0 })
  numReviews: number;

  @Prop({ type: Number, default: 0 })
  totalSales: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
