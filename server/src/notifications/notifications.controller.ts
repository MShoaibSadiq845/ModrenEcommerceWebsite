import { Controller, Get, Put, Param, Inject } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async getAll() {
    return this.notificationsService.findAll();
  }

  @Get('unread-count')
  async getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  // IMPORTANT: static 'read-all' route MUST come before the ':id/read' param route
  @Put('read-all')
  async markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
