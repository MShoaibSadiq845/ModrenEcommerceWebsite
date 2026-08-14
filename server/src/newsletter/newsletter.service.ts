import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name)
    private readonly model: Model<NewsletterDocument>,
  ) {}

  async subscribe(dto: SubscribeDto): Promise<{ message: string }> {
    const existing = await this.model.findOne({ email: dto.email }).exec();
    if (existing) {
      if (existing.active) throw new ConflictException('Email already subscribed.');
      // Re-activate if previously unsubscribed
      existing.active = true;
      await existing.save();
      return { message: 'Re-subscribed successfully!' };
    }
    await this.model.create(dto);
    return { message: 'Subscribed successfully!' };
  }

  async findAll(): Promise<Newsletter[]> {
    return this.model.find({ active: true }).sort({ createdAt: -1 }).exec();
  }

  async unsubscribe(id: string): Promise<{ message: string }> {
    await this.model.findByIdAndUpdate(id, { active: false }).exec();
    return { message: 'Unsubscribed.' };
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    await this.model.findByIdAndDelete(id).exec();
    return { deleted: true };
  }

  async count(): Promise<{ count: number }> {
    const count = await this.model.countDocuments({ active: true }).exec();
    return { count };
  }
}
