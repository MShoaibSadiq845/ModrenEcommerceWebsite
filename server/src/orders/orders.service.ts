import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { Coupon, CouponDocument } from './schemas/coupon.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    let totalAmount = 0;
    let pointsUsed = 0;
    const processedItems: any[] = [];

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.name} not found`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Remaining: ${product.stock}`,
        );
      }

      const method = item.paymentMethod || 'currency';
      if (method === 'points') {
        const requiredPoints = (product.pointsPrice || 0) * item.quantity;
        pointsUsed += requiredPoints;
      } else {
        const itemPrice = product.isOnSale ? product.salePrice : product.price;
        totalAmount += itemPrice * item.quantity;
      }

      processedItems.push({
        product: product._id as any,
        name: product.name,
        price: product.isOnSale ? product.salePrice : product.price,
        pointsPrice: product.pointsPrice || 0,
        quantity: item.quantity,
        paymentMethod: method,
      });

      // Deduct stock and increment totalSales
      product.stock -= item.quantity;
      product.totalSales += item.quantity;
      await product.save();
    }

    if (pointsUsed > 0 && user.loyaltyPoints < pointsUsed) {
      throw new BadRequestException(
        `Insufficient loyalty points. Required: ${pointsUsed}, Available: ${user.loyaltyPoints}`,
      );
    }

    // Calculate coupon discount if promoCode is provided
    let discountPercentage = 0;
    if (dto.promoCode) {
      const coupon = await this.couponModel.findOne({
        code: dto.promoCode.toUpperCase(),
        isActive: true,
      });
      if (!coupon) {
        throw new BadRequestException('Invalid or expired coupon code');
      }
      discountPercentage = coupon.discountPercentage;
    }

    const discountAmount = Math.round((totalAmount * discountPercentage) / 100);
    const finalSubtotal = Math.max(0, totalAmount - discountAmount);
    const deliveryFee = finalSubtotal > 0 ? 15 : 0;
    const finalTotalAmount = finalSubtotal + deliveryFee;

    // Earn 1 point per $10 spent on final subtotal (before delivery fee)
    // Rule: accumulate up to 1000 points → redeem for one free item worth up to $50
    const pointsEarned = Math.floor(finalSubtotal / 10);

    // Update user's loyalty points balance
    user.loyaltyPoints = user.loyaltyPoints - pointsUsed + pointsEarned;
    await user.save();

    const order = await this.orderModel.create({
      user: user._id as any,
      items: processedItems,
      totalAmount: finalTotalAmount,
      pointsEarned,
      pointsUsed,
      status: OrderStatus.PENDING,
      shippingAddress: dto.shippingAddress || {
        street: '123 Main St',
        city: 'New York',
        postalCode: '10001',
        country: 'USA',
      },
    });

    // Real-time notification for admin
    await this.notificationsService.createAndBroadcast({
      title: '🛒 New Order Placed!',
      message: `Order #${order._id ? order._id.toString().slice(-6) : 'NEW'} placed by ${user.name} for $${totalAmount.toFixed(2)} (${pointsEarned} pts earned)`,
      type: 'order',
      link: `/admin/orders`,
    });

    return order;
  }

  async findUserOrders(userId: string) {
    return this.orderModel
      .find({ user: userId as any })
      .sort({ createdAt: -1 })
      .populate('items.product')
      .exec();
  }

  async findAll(status?: OrderStatus) {
    const filter: any = {};
    if (status) filter.status = status;
    return this.orderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product')
      .exec();
  }

  async findById(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('user', 'name email loyaltyPoints')
      .populate('items.product')
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('user', 'name email')
      .exec();

    if (!order) throw new NotFoundException('Order not found');

    await this.notificationsService.createAndBroadcast({
      title: '📦 Order Status Updated',
      message: `Order #${order._id ? order._id.toString().slice(-6) : 'ID'} status changed to ${status}`,
      type: 'order',
      link: `/admin/orders`,
    });

    return order;
  }

  async getAdminMetrics() {
    const totalOrders = await this.orderModel.countDocuments();
    const activeOrders = await this.orderModel.countDocuments({
      status: { $in: [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED] },
    });
    const completedOrders = await this.orderModel.countDocuments({
      status: OrderStatus.DELIVERED,
    });
    const canceledOrders = await this.orderModel.countDocuments({
      status: OrderStatus.CANCELED,
    });

    const revenueResult = await this.orderModel.aggregate([
      { $match: { status: { $ne: OrderStatus.CANCELED } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Real aggregation to group order totals by month and year
    const monthlyIncome = await this.orderModel.aggregate([
      { $match: { status: { $ne: OrderStatus.CANCELED } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          sales: { $sum: '$totalAmount' },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesGraphData = monthlyIncome.map(item => ({
      year: item._id.year,
      month: monthNames[item._id.month - 1] || `${item._id.month}`,
      monthNum: item._id.month,
      sales: item.sales,
    }));

    const bestSellers = await this.productModel
      .find()
      .sort({ totalSales: -1 })
      .limit(5)
      .exec();

    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .exec();

    return {
      totalOrders,
      activeOrders,
      completedOrders,
      canceledOrders,
      totalRevenue,
      salesGraphData,
      bestSellers,
      recentOrders,
    };
  }
}
