import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CreateCouponDto } from './dto/coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  // ── Public: validate a coupon code ──────────────────────────────────────
  @Get('validate/:code')
  @HttpCode(HttpStatus.OK)
  async validateCoupon(@Param('code') code: string) {
    try {
      const coupon = await this.couponModel.findOne({
        code: code.toUpperCase().trim(),
        isActive: true,
      });
      if (!coupon) {
        return { valid: false, message: 'Invalid or expired coupon code' };
      }
      return {
        valid: true,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
      };
    } catch {
      return { valid: false, message: 'Failed to validate coupon. Please try again.' };
    }
  }

  // ── Admin-only routes (jwt + global RolesGuard) ──────────────────────────

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAllCoupons() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponModel.create({
      code: dto.code.toUpperCase().trim(),
      discountPercentage: dto.discountPercentage,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });
  }

  @Put(':id/toggle')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async toggleCoupon(@Param('id') id: string) {
    const coupon = await this.couponModel.findById(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return coupon;
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteCoupon(@Param('id') id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon deleted successfully' };
  }
}
