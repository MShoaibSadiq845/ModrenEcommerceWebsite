import {
  Controller, Get, Post, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsletterService } from './newsletter.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { RoleGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly svc: NewsletterService) {}

  /* PUBLIC */
  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  subscribe(@Body() dto: SubscribeDto) {
    return this.svc.subscribe(dto);
  }

  /* ADMIN */
  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.svc.findAll();
  }

  @Get('count')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  count() {
    return this.svc.count();
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }
}
