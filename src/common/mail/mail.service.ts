import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggingService } from '../logger/logger.service';
import { EMAIL } from 'src/helpers/text.helper';

@Injectable()
export class MailService {
  private readonly SERVICE_NAME = 'MailService';

  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private logger: LoggingService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('ACCOUNT_GMAIL'),
        pass: this.configService.get<string>('APP_PASSWORD_GMAIL'),
      },
    });
  }

  async sendGuestConsultationEmail(data: {
    name: string;
    phone: string;
    issueInterest: string;
    issueDescription: string;
  }) {
    const logbase = `${this.SERVICE_NAME}/sendGuestConsultationEmail:`;

    const targetEmail = this.configService.get<string>('TARGET_GMAIL');
    const mailOptions = {
      from: `"3fam" <${this.configService.get<string>('ACCOUNT_GMAIL')}>`,
      to: targetEmail,
      subject: EMAIL.SUBJECT_SEND_CONSULTATION,
      html: this.createTemplate(data),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(logbase, `Email gửi tới ${targetEmail} từ ${data.name}`);
    } catch (error) {
      this.logger.error(logbase, `Email gửi tới ${targetEmail} từ ${data.name} thất bại: ${error.message}`);
    }
  }

  private createTemplate(data: any) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="padding: 0px; color: #333;">
          <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.name}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.phone}</p>
            <p style="margin: 15px 20px;"><strong>Hạng mục cần tư vấn:</strong> ${data.issueInterest}</p>
            <p style="margin: 15px 20px;"><strong>Mô tả chi tiết:</strong> ${data.issueDescription}</p>
          </div>
          <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.phone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
        </div>
    `;
  }
}
