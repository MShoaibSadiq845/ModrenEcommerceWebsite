import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Inject,
  UseInterceptors, UploadedFile, BadRequestException,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RoleGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { GetUser } from '../auth/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('products')
export class ProductsController {
  constructor(
    @Inject(ProductsService) private readonly productsService: ProductsService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(CloudinaryService) private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ── Public ─────────────────────────────────────────────────────────────────
  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(@Query() query: ProductQuery) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  getCategories() {
    return this.productsService.getCategories();
  }

  // All reviews across every product — for home page "Happy Customers" section
  @Get('reviews/all')
  @HttpCode(HttpStatus.OK)
  getAllReviews(@Query('limit') limit?: string) {
    return this.productsService.getAllReviews(limit ? Number(limit) : 30);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  // ── Admin only ─────────────────────────────────────────────────────────────
  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded or invalid file field name. Field name must be "file".',
      );
    }
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      return { url: (result as any).secure_url };
    } catch (err: any) {
      throw new BadRequestException(
        err?.message || 'Image upload failed. Please try again.',
      );
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Put(':id/sale')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  async toggleSale(
    @Param('id') id: string,
    @Body() body: { isOnSale: boolean; salePrice?: number },
  ) {
    const product = await this.productsService.toggleSale(id, body.isOnSale, body.salePrice);
    if (body.isOnSale) {
      await this.notificationsService.createAndBroadcast({
        title: '🔥 Flash Sale Alert!',
        message: `${product.name} is now on sale for $${product.salePrice || product.price}!`,
        type: 'sale',
        link: `/shop/${product._id}`,
      });
    }
    return product;
  }

  @Post(':id/reviews')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async createReview(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.productsService.addReview(
      id,
      user.name || 'Verified Customer',
      dto.rating,
      dto.comment,
      user._id?.toString(),
    );
  }
}
