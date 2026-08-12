import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @Inject(NotificationsGateway) private readonly gateway: NotificationsGateway,
  ) {}

  async findAll() {
    return this.notificationModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }

  async getUnreadCount() {
    const count = await this.notificationModel.countDocuments({ isRead: false });
    return { count };
  }

  async markAsRead(id: string) {
    return this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }

  async markAllAsRead() {
    await this.notificationModel.updateMany({ isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }

  async createAndBroadcast(data: {
    title: string;
    message: string;
    type?: string;
    link?: string;
  }) {
    const notification = await this.notificationModel.create(data);
    this.gateway.broadcastNotification(notification);
    return notification;
  }
}
