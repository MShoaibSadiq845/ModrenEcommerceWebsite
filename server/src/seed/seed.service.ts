import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Product, ProductDocument, PurchaseType } from '../products/schemas/product.schema';
import { Order, OrderDocument, OrderStatus } from '../orders/schemas/order.schema';
import { Notification, NotificationDocument } from '../notifications/schemas/notification.schema';
import { Coupon, CouponDocument } from '../orders/schemas/coupon.schema';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAll();
  }

  async seedAll() {
    try {
      const userCount = await this.userModel.countDocuments();
      if (userCount === 0) {
        this.logger.log('Seeding initial MongoDB database data...');
        await this.seedUsers();
        await this.seedProducts();
        await this.seedOrders();
        await this.seedNotifications();
        await this.seedCoupons();
        this.logger.log('Database seeding completed successfully!');
      } else {
        // Even if users are seeded, make sure coupons are seeded too
        await this.seedCoupons();
        this.logger.log('Database already populated. Skipping initial seed.');
      }
    } catch (err) {
      this.logger.error('Error during database seeding:', err);
    }
  }

  async seedUsers() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await this.userModel.create([
      {
        name: 'Regular Customer',
        email: 'user@shop.co',
        password: hashedPassword,
        role: UserRole.USER,
        loyaltyPoints: 750,
        avatar: '/images/51.png',
      },
      {
        name: 'Store Manager Admin',
        email: 'admin@shop.co',
        password: hashedPassword,
        role: UserRole.ADMIN,
        loyaltyPoints: 1200,
        avatar: '/images/38.png',
      },
      {
        name: 'System Super Admin',
        email: 'superadmin@shop.co',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        loyaltyPoints: 5000,
        avatar: '/images/40.png',
      },
    ]);
  }

  async seedProducts() {
    const sampleProducts = [
      {
        name: 'T-SHIRT WITH TAPE DETAILS',
        description: 'A classic black t-shirt with distinctive side tape detail, crafted from 100% premium breathable cotton.',
        price: 120,
        salePrice: 120,
        isOnSale: false,
        purchaseType: PurchaseType.REGULAR,
        pointsPrice: 1200,
        category: 'Casual',
        brand: 'SHOP.CO Essentials',
        stock: 50,
        sku: 'TSH-BLK-001',
        images: ['/images/7.png', '/images/8.png', '/images/9.png'],
        tags: ['t-shirt', 'casual', 'black', 'cotton'],
        rating: 4.5,
        numReviews: 24,
        totalSales: 85,
      },
      {
        name: 'SKINNY FIT JEANS',
        description: 'Modern slim fit stretch denim jeans designed for maximum flexibility and durable day-to-day comfort.',
        price: 260,
        salePrice: 240,
        isOnSale: true,
        purchaseType: PurchaseType.REGULAR,
        pointsPrice: 2400,
        category: 'Casual',
        brand: 'Denim Co',
        stock: 30,
        sku: 'JNS-BLU-002',
        images: ['/images/10.png', '/images/11.png', '/images/12.png'],
        tags: ['jeans', 'skinny', 'denim', 'blue'],
        rating: 4.8,
        numReviews: 42,
        totalSales: 120,
      },
      {
        name: 'CHECKERED SHIRT',
        description: 'Versatile button-down checkered cotton shirt suitable for both relaxed office wear and evening outings.',
        price: 180,
        salePrice: 180,
        isOnSale: false,
        purchaseType: PurchaseType.HYBRID,
        pointsPrice: 1800,
        category: 'Formal',
        brand: 'Urban Trend',
        stock: 25,
        sku: 'SHR-CHK-003',
        images: ['/images/13.png', '/images/14.png'],
        tags: ['shirt', 'checkered', 'formal'],
        rating: 4.6,
        numReviews: 18,
        totalSales: 64,
      },
      {
        name: 'SLEEVE STRIPED T-SHIRT',
        description: 'Vibrant graphic striped cotton tee designed with lightweight mesh panels for enhanced airflow.',
        price: 160,
        salePrice: 130,
        isOnSale: true,
        purchaseType: PurchaseType.HYBRID,
        pointsPrice: 1300,
        category: 'Casual',
        brand: 'SHOP.CO Sport',
        stock: 40,
        sku: 'TSH-STR-004',
        images: ['/images/15.png', '/images/16.png'],
        tags: ['t-shirt', 'striped', 'sale'],
        rating: 4.7,
        numReviews: 31,
        totalSales: 92,
      },
      {
        name: 'EXCLUSIVE LOYALTY HOODIE',
        description: 'Limited-edition heavyweight fleece hoodie available exclusively to loyal community members via Points!',
        price: 300,
        salePrice: 300,
        isOnSale: false,
        purchaseType: PurchaseType.LOYALTY_ONLY,
        pointsPrice: 500,
        category: 'Party',
        brand: 'VIP Edition',
        stock: 15,
        sku: 'HOD-LOY-005',
        images: ['/images/17.png', '/images/18.png'],
        tags: ['hoodie', 'loyalty', 'vip', 'points-only'],
        rating: 5.0,
        numReviews: 15,
        totalSales: 40,
      },
      {
        name: 'VERTICAL STRIPED SHIRT',
        description: 'Sharp vertical stripe long-sleeve collared shirt tailored with modern slim wrist cuffs.',
        price: 212,
        salePrice: 212,
        isOnSale: false,
        purchaseType: PurchaseType.REGULAR,
        pointsPrice: 2120,
        category: 'Formal',
        brand: 'Elite Sartorial',
        stock: 20,
        sku: 'SHR-VSTR-006',
        images: ['/images/30.png', '/images/31.png'],
        tags: ['shirt', 'striped', 'formal'],
        rating: 4.4,
        numReviews: 19,
        totalSales: 50,
      },
      {
        name: 'COURT GRAPHIC TEE',
        description: 'Streetwear graphic graphic shirt made with heavy organic cotton yarn.',
        price: 145,
        salePrice: 145,
        isOnSale: false,
        purchaseType: PurchaseType.HYBRID,
        pointsPrice: 1450,
        category: 'Gym',
        brand: 'Athletic Wear',
        stock: 35,
        sku: 'TSH-GRP-007',
        images: ['/images/32.png', '/images/34.png'],
        tags: ['gym', 'tee', 'graphic'],
        rating: 4.3,
        numReviews: 14,
        totalSales: 38,
      },
      {
        name: 'LOOSE FIT BERMUDA SHORTS',
        description: 'Relaxed washed denim bermuda shorts with deep utility pockets and custom nickel rivets.',
        price: 80,
        salePrice: 80,
        isOnSale: false,
        purchaseType: PurchaseType.REGULAR,
        pointsPrice: 800,
        category: 'Casual',
        brand: 'Denim Co',
        stock: 60,
        sku: 'SHT-BER-008',
        images: ['/images/35.png', '/images/36.png'],
        tags: ['shorts', 'casual', 'denim'],
        rating: 4.6,
        numReviews: 28,
        totalSales: 74,
      },
    ];

    await this.productModel.create(sampleProducts);
  }

  async seedOrders() {
    const user = await this.userModel.findOne({ email: 'user@shop.co' });
    const products = await this.productModel.find();
    if (!user || products.length < 2) return;

    const now = new Date('2026-08-11T12:00:00Z');
    const dateJune = new Date(now);
    dateJune.setMonth(now.getMonth() - 2);
    const dateJuly = new Date(now);
    dateJuly.setMonth(now.getMonth() - 1);
    const dateAugust = new Date(now);

    // Use Model.insertMany with timestamps:false to allow manual createdAt
    await this.orderModel.insertMany(
      [
        {
          user: user._id,
          items: [
            {
              product: products[0]._id,
              name: products[0].name,
              price: products[0].price,
              pointsPrice: products[0].pointsPrice,
              quantity: 1,
              paymentMethod: 'currency',
            },
          ],
          totalAmount: 120,
          pointsEarned: 12,
          pointsUsed: 0,
          status: OrderStatus.DELIVERED,
          createdAt: dateJune,
          updatedAt: dateJune,
        },
        {
          user: user._id,
          items: [
            {
              product: products[1]._id,
              name: products[1].name,
              price: products[1].salePrice || products[1].price,
              pointsPrice: products[1].pointsPrice,
              quantity: 1,
              paymentMethod: 'currency',
            },
          ],
          totalAmount: 240,
          pointsEarned: 24,
          pointsUsed: 0,
          status: OrderStatus.DELIVERED,
          createdAt: dateJuly,
          updatedAt: dateJuly,
        },
        {
          user: user._id,
          items: [
            {
              product: products[2]._id,
              name: products[2].name,
              price: products[2].price,
              pointsPrice: products[2].pointsPrice,
              quantity: 1,
              paymentMethod: 'currency',
            },
          ],
          totalAmount: 180,
          pointsEarned: 18,
          pointsUsed: 0,
          status: OrderStatus.PROCESSING,
          createdAt: dateAugust,
          updatedAt: dateAugust,
        },
      ],
      { timestamps: false } as any,
    );
  }

  async seedNotifications() {
    await this.notificationModel.create([
      {
        title: '🎉 Welcome to SHOP.CO!',
        message: 'Your account is created and loaded with 750 welcome loyalty points.',
        type: 'system',
        isRead: false,
      },
      {
        title: '🔥 New Flash Sale on Skinny Fit Jeans!',
        message: 'Skinny Fit Jeans are now 20% OFF! Grab yours while stock lasts.',
        type: 'sale',
        isRead: false,
        link: '/shop',
      },
    ]);
  }

  async seedCoupons() {
    const couponCount = await this.couponModel.countDocuments();
    if (couponCount === 0) {
      await this.couponModel.create({
        code: 'SHOP20',
        discountPercentage: 20,
        isActive: true,
      });
      this.logger.log('Seeded SHOP20 coupon code successfully!');
    }
  }
}
