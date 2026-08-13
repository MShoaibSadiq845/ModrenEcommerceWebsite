import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findAll() {
    return this.userModel.find().select('-password').sort({ createdAt: -1 }).exec();
  }

  async findAllPaginated(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getLoyaltyPoints(id: string) {
    const user = await this.findById(id);
    return { loyaltyPoints: user.loyaltyPoints };
  }

  // Update name, phone, avatar URL
  async updateProfile(id: string, dto: UpdateProfileDto) {
    const updates: Record<string, any> = {};
    if (dto.name !== undefined)   updates.name   = dto.name;
    if (dto.phone !== undefined)  updates.phone  = dto.phone;
    if (dto.avatar !== undefined) updates.avatar = dto.avatar;

    const user = await this.userModel
      .findByIdAndUpdate(id, updates, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async addLoyaltyPoints(id: string, points: number) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $inc: { loyaltyPoints: points } }, { new: true })
      .select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateShippingAddress(id: string, dto: UpdateShippingDto) {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        { shippingAddress: { ...dto, state: dto.state || '' } },
        { new: true },
      )
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateRole(id: string, role: UserRole) {
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, { role }, { new: true })
      .select('-password')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }
}
