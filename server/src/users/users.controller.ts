import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { GetUser } from '../auth/get-user.decorator';

// All routes require a valid JWT
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  // Admin + Super Admin: fetch all users from DB
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  // Any authenticated user: get own loyalty points
  @Get('loyalty-points')
  async getLoyaltyPoints(@GetUser('_id') userId: string) {
    return this.usersService.getLoyaltyPoints(userId);
  }

  // Super Admin only: update a user's role
  @Put(':id/role')
  @Roles(UserRole.SUPER_ADMIN)
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ) {
    return this.usersService.updateRole(id, role);
  }

  // Super Admin only: permanently delete a user
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // Get any user by id
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
