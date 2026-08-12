import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Inject,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService, ProductQuery } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RoleGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
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
  getAll(@Query() query: ProductQuery) {
    return this.productsService.findAll(query);
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  // ── Admin only ─────────────────────────────────────────────────────────────
  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded or invalid file field name. Field name must be "file".');
    }
    const result = await this.cloudinaryService.uploadFile(file);
    return { url: (result as any).secure_url };
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Put(':id/sale')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
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
}
