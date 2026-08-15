import {
  Controller, Get, Put, Param, Inject,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll() {
    return this.notificationsService.findAll();
  }

  @Get('unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  // IMPORTANT: static 'read-all' route MUST come before the ':id/read' param route
  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Put(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
