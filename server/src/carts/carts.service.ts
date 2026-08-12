import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddCartItemDto } from './dto/cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string) {
    const cart = await this.cartModel.findOne({ user: userId }).exec();
    return cart || { items: [] };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.cartModel.findOneAndUpdate(
      { user: userId },
      { $setOnInsert: { user: new Types.ObjectId(userId) } },
      { upsert: true, new: true },
    );

    const paymentMethod = dto.paymentMethod || 'currency';
    const existingIndex = cart.items.findIndex((item) =>
      item.product.equals(dto.productId) &&
      item.paymentMethod === paymentMethod &&
      item.size === (dto.size || '') &&
      item.color === (dto.color || ''),
    );

    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += dto.quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(dto.productId),
        name: dto.name,
        price: dto.price,
        pointsPrice: dto.pointsPrice || 0,
        quantity: dto.quantity,
        paymentMethod,
        size: dto.size || '',
        color: dto.color || '',
        image: dto.image || '',
      } as any);
    }

    await cart.save();
    return cart;
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    // Mongoose subdocument .id() helper
    const item = (cart.items as any).id(itemId);
    if (!item) throw new NotFoundException('Cart item not found');

    if (dto.quantity !== undefined) item.quantity = Math.max(1, dto.quantity);
    if (dto.size !== undefined) item.size = dto.size;
    if (dto.color !== undefined) item.color = dto.color;

    await cart.save();
    return cart;
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({ user: userId }).exec();
    if (!cart) throw new NotFoundException('Cart not found');

    // Filter out by string comparison of _id
    cart.items = cart.items.filter(
      (item: any) => item._id.toString() !== itemId,
    ) as any;
    await cart.save();
    return cart;
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel
      .findOneAndUpdate(
        { user: userId },
        { items: [] },
        { new: true, upsert: true },
      )
      .exec();
    return cart;
  }
}
