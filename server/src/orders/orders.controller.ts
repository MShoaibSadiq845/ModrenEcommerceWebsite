import {
  Controller, Get, Post, Put,
  Body, Param, Query, UseGuards, Inject,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { RoleGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';
import { GetUser } from '../auth/get-user.decorator';
import { OrderStatus } from './schemas/order.schema';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(@Inject(OrdersService) private readonly ordersService: OrdersService) {}

  // Any authenticated user
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createOrder(@GetUser('_id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(userId, dto);
  }

  @Get('my-orders')
  @HttpCode(HttpStatus.OK)
  getMyOrders(@GetUser('_id') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }

  // Admin only — static routes before param routes
  @Get('metrics')
  @UseGuards(RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  getAdminMetrics() {
    return this.ordersService.getAdminMetrics();
  }

  @Get()
  @UseGuards(RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  getAllOrders(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getOrderById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
