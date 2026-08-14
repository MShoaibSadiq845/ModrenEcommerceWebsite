import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Contact, ContactDocument, ContactStatus } from './schemas/contact.schema';
import { CreateContactDto } from './dto/create-contact.dto';
import { ReplyContactDto } from './dto/reply-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  /* ── Create a new contact message (public) ── */
  async create(dto: CreateContactDto): Promise<Contact> {
    const doc = new this.contactModel(dto);
    return doc.save();
  }

  /* ── Get all messages (admin) ── */
  async findAll(): Promise<Contact[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).exec();
  }

  /* ── Get one message (admin) ── */
  async findOne(id: string): Promise<Contact> {
    const doc = await this.contactModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Contact message not found');
    return doc;
  }

  /* ── Mark as read (admin) ── */
  async markRead(id: string): Promise<Contact> {
    const doc = await this.contactModel
      .findByIdAndUpdate(
        id,
        { status: ContactStatus.READ },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Contact message not found');
    return doc;
  }

  /* ── Reply by email (admin) ── */
  async reply(id: string, dto: ReplyContactDto): Promise<Contact> {
    const doc = await this.contactModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Contact message not found');

    /* Send email via nodemailer */
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: doc.email,
      subject: `Re: ${doc.subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#111;padding:20px 24px;border-radius:8px 8px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:20px;">SHOP.CO Support</h2>
          </div>
          <div style="background:#f9f9f9;padding:24px;border:1px solid #e5e5e5;border-radius:0 0 8px 8px;">
            <p style="color:#555;font-size:14px;margin:0 0 8px 0;">Hi <strong>${doc.name}</strong>,</p>
            <p style="color:#555;font-size:14px;margin:0 0 16px 0;">
              Thank you for reaching out. Here is our reply to your query:
            </p>
            <div style="background:#fff;border-left:4px solid #111;padding:16px;border-radius:4px;margin-bottom:16px;">
              <p style="color:#111;font-size:14px;margin:0;white-space:pre-wrap;">${dto.reply}</p>
            </div>
            <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />
            <p style="color:#888;font-size:12px;margin:0;">
              Your original message: <em>${doc.message}</em>
            </p>
            <p style="color:#aaa;font-size:11px;margin:12px 0 0 0;">
              © ${new Date().getFullYear()} SHOP.CO — All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    /* Persist reply + update status */
    doc.adminReply = dto.reply;
    doc.status = ContactStatus.REPLIED;
    doc.repliedAt = new Date();
    return doc.save();
  }

  /* ── Unread count (admin badge) ── */
  async unreadCount(): Promise<{ count: number }> {
    const count = await this.contactModel
      .countDocuments({ status: ContactStatus.UNREAD })
      .exec();
    return { count };
  }

  /* ── Delete a message (admin) ── */
  async remove(id: string): Promise<{ deleted: boolean }> {
    const res = await this.contactModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Contact message not found');
    return { deleted: true };
  }
}
