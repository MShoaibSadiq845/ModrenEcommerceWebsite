import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, PurchaseType } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductQuery {
  category?: string;
  purchaseType?: PurchaseType;
  isOnSale?: boolean | string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
  color?: string | string[];
  size?: string | string[];
}

import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(NotificationsGateway) private readonly gateway: NotificationsGateway,
  ) {}

  private normalizeArrayParam(value?: string | string[]) {
    if (value === undefined) return [];
    const values = Array.isArray(value) ? value : String(value).split(',');
    return values.map((item) => item.trim()).filter(Boolean);
  }

  async findAll(query: ProductQuery) {
    const {
      category,
      purchaseType,
      isOnSale,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
      color,
      size,
    } = query;

    const filters: any[] = [];
    const baseFilter: any = {};

    if (category) {
      baseFilter.category = { $regex: new RegExp(category, 'i') };
    }

    if (purchaseType) {
      baseFilter.purchaseType = purchaseType;
    }

    if (isOnSale !== undefined) {
      baseFilter.isOnSale =
        isOnSale === true || String(isOnSale).toLowerCase() === 'true';
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      baseFilter.price = {};
      if (minPrice !== undefined) baseFilter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) baseFilter.price.$lte = Number(maxPrice);
    }

    if (Object.keys(baseFilter).length) {
      filters.push(baseFilter);
    }

    if (search) {
      filters.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } },
        ],
      });
    }

    const colors = this.normalizeArrayParam(color);
    if (colors.length) {
      filters.push({
        $or: [
          { color: { $in: colors.map((c) => new RegExp(c, 'i')) } },
          { tags: { $in: colors.map((c) => new RegExp(c, 'i')) } },
        ],
      });
    }

    const sizes = this.normalizeArrayParam(size);
    if (sizes.length) {
      filters.push({
        $or: [
          { size: { $in: sizes.map((s) => new RegExp(s, 'i')) } },
          { tags: { $in: sizes.map((s) => new RegExp(s, 'i')) } },
        ],
      });
    }

    const finalFilter =
      filters.length > 1 ? { $and: filters } : filters[0] || {};

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'rating' || sort === 'most-popular') sortOptions = { rating: -1 };
    else if (sort === 'newest') sortOptions = { createdAt: -1 };

    const skip = (page - 1) * Number(limit);
    const total = await this.productModel.countDocuments(finalFilter);
    const products = await this.productModel
      .find(finalFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    return {
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    };
  }

  async findById(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    const product = new this.productModel(dto);
    return product.save();
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string) {
    const product = await this.productModel.findByIdAndDelete(id).exec();
    if (!product) throw new NotFoundException('Product not found');
    return { message: 'Product removed successfully' };
  }

  async toggleSale(id: string, isOnSale: boolean, salePrice?: number) {
    const updateData: any = { isOnSale };
    if (salePrice !== undefined) {
      updateData.salePrice = salePrice;
    }
    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async addReview(
    productId: string,
    userName: string,
    rating: number,
    comment: string,
    userId?: string,
  ) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const newReview: any = {
      name: userName || 'Anonymous Customer',
      rating: Number(rating),
      text: comment,
      verified: true,
      user: userId,
      createdAt: new Date(),
    };

    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    const totalRatingSum = product.reviews.reduce((sum, item) => sum + item.rating, 0);
    product.rating = Number((totalRatingSum / product.numReviews).toFixed(1));

    await product.save();
    this.gateway.broadcastReview(productId, newReview, product);
    return product;
  }

  async getCategories() {
    return this.productModel.distinct('category').exec();
  }

  // Fetch all reviews across all products — used on the home page
  async getAllReviews(limit = 20) {
    const products = await this.productModel
      .find({ 'reviews.0': { $exists: true } })  // only products that have at least 1 review
      .select('name reviews rating')
      .exec();

    // Flatten all reviews, attach product name & rating
    const allReviews: any[] = [];
    for (const p of products) {
      for (const r of p.reviews) {
        // Mongoose subdocument may or may not have toObject — use safe cast
        const reviewObj = typeof (r as any).toObject === 'function'
          ? (r as any).toObject()
          : { ...r };
        allReviews.push({
          ...reviewObj,
          productName: p.name,
          productRating: p.rating,
        });
      }
    }

    // Sort by most recent first, return top N
    allReviews.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return allReviews.slice(0, limit);
  }
}
