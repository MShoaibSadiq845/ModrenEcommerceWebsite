import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
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

  async getCategories() {
    return this.productModel.distinct('category').exec();
  }
}
