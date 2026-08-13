import {
  Controller, Get, Put, Delete, Post,
  Body, Param, UseGuards, Inject,
  UseInterceptors, UploadedFile, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RoleGuard } from '../auth/roles.guard';
import { UserRole } from './schemas/user.schema';
import { GetUser } from '../auth/get-user.decorator';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(CloudinaryService) private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ── Admin ──────────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  getAllUsers(@Query() query: PaginationQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    return this.usersService.findAllPaginated(page, limit);
  }

  // ── Any authenticated user ─────────────────────────────────────────────────

  @Get('loyalty-points')
  getLoyaltyPoints(@GetUser('_id') userId: string) {
    return this.usersService.getLoyaltyPoints(userId);
  }

  // Update display name, phone
  @Put('profile')
  updateProfile(
    @GetUser('_id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  // Upload avatar image → Cloudinary → save URL to DB
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @GetUser('_id') userId: string,
    @UploadedFile() file: any,
  ) {
    const result = await this.cloudinaryService.uploadFile(file);
    const url = (result as any).secure_url;
    return this.usersService.updateProfile(userId, { avatar: url });
  }

  // Save / update delivery address
  @Put('shipping-address')
  updateShipping(
    @GetUser('_id') userId: string,
    @Body() dto: UpdateShippingDto,
  ) {
    return this.usersService.updateShippingAddress(userId, dto);
  }

  // ── Super Admin ────────────────────────────────────────────────────────────

  @Put(':id/role')
  @UseGuards(RoleGuard(UserRole.SUPER_ADMIN))
  updateUserRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @UseGuards(RoleGuard(UserRole.SUPER_ADMIN))
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // ── Parameterised — keep LAST to avoid shadowing static routes ────────────

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
