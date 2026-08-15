import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';
import { RoleGuard } from '../auth/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /* ── PUBLIC: anyone can submit a message ── */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  /* ── ADMIN only below ── */
  @Get()
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.contactService.findAll();
  }

  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  unreadCount() {
    return this.contactService.unreadCount();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }

  @Put(':id/read')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  markRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }

  @Post(':id/reply')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  reply(@Param('id') id: string, @Body() dto: ReplyContactDto) {
    return this.contactService.reply(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
