import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggingService } from '../logger/logger.service';
import { EMAIL } from 'src/helpers/text.helper';
import { USER_CONST } from 'src/modules/user/app/user.interface';

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

  async sendGuestConsultationEmail(data: { name: string; phone: string; issueInterest: string; issueDescription: string }) {
    const html = this.getGusetTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_CONSULTATION, html, `GuestConsultation:${data.name}`);
  }

  async sendTeamEmail(data: any) {
    const html = this.getTeamTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_TEAM, html, `Team:${data.teamUserName}`);
  }

  async sendDoctorEmail(data: any) {
    const html = this.getDoctorTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_DOCTOR, html, `Doctor:${data.userName}`);
  }

  async sendSightSeeingEmail(data: any) {
    const html = this.getSightSeeingTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_SIGHTSEEING, html, `SightSeeing:${data.userName}`);
  }

  async sendRequestQrEmail(data: any) {
    const html = this.getRequestQrTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_REQUEST_QR, html, `RequestQr:${data.userName}`);
  }

  async sendConsignmentEmail(data: any) {
    const html = this.getConsignmentTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_CONSIGNMENT, html, `Consignment:${data.senderName}`);
  }

  private async sendMail(subject: string, html: string, logContext = '') {
    const logbase = `${this.SERVICE_NAME}/sendMail:${logContext}`;

    const targetEmail = this.configService.get<string>('TARGET_GMAIL') || '';
    const targetEmails = targetEmail
      .split(/[;,]/)
      .map((email) => email.trim())
      .filter(Boolean);

    const mailOptions = {
      from: `"3fam" <${this.configService.get<string>('ACCOUNT_GMAIL')}>`,
      to: targetEmails,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(logbase, `Email gửi tới ${targetEmails.join(', ')} thành công`);
    } catch (error) {
      this.logger.error(logbase, `Email gửi tới ${targetEmails.join(', ')} thất bại: ${error.message}`);
    }
  }

  private getGusetTemplate(data: any) {
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

  private getDoctorTemplate(data: any) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="padding: 0px; color: #333;">
          <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.userName}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
            <p style="margin: 15px 20px;"><strong>Mô tả chi tiết:</strong> ${data.note}</p>
          </div>
          <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
        </div>
    `;
  }

  
  private getSightSeeingTemplate(data: any) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="padding: 0px; color: #333;">
          <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 15px 20px;"><strong>Tên nhà yến:</strong> ${data.homeName}</p>
            <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.userName}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
            <p style="margin: 15px 20px;"><strong>Số lượng người tham quan:</strong> ${data.numberAttend}</p>
          </div>
          <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
        </div>
    `;
  }
  
  private getTeamTemplate(data: any) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="padding: 0px; color: #333;">
          <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 15px 20px;"><strong>Tên đội/xưởng:</strong> ${data.teamName}</p>
            <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.teamUserName}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.teamPhone}</p>
            <p style="margin: 15px 20px;"><strong>Địa chỉ:</strong> ${data.teamAddress}</p>
            <p style="margin: 15px 20px;"><strong>Loại đội/xưởng đăng ký:</strong> ${data.userTypeKeyWord  == USER_CONST.USER_TYPE.FACTORY.value ? USER_CONST.USER_TYPE.FACTORY.text : USER_CONST.USER_TYPE.TECHNICAL.text}</p>
          </div>
          <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.teamPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
        </div>
    `;
  }


  private getRequestQrTemplate(data: any) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="padding: 0px; color: #333;">
          <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 15px 20px;"><strong>Tên nhà yến:</strong> ${data.userHomeName}</p>
            <p style="margin: 15px 20px;"><strong>Họ và tên:</strong> ${data.userName}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại:</strong> ${data.userPhone}</p>
            <p style="margin: 15px 20px;"><strong>Đợt thu hoạch:</strong> ${data.harverstPhase}</p>
          </div>
          <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.userPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
        </div>
    `;
  }

  private getConsignmentTemplate(data: any) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="padding: 0px; color: #333;">
          <div style="background: #fff; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 15px 20px;"><strong>Người gửi:</strong> ${data.senderName}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại người gửi:</strong> ${data.senderPhone}</p>
            <p style="margin: 15px 20px;"><strong>Loại tổ yến:</strong> ${data.nestType}</p>
            <p style="margin: 15px 20px;"><strong>Số lượng tổ yến (gram):</strong> ${data.nestQuantity}</p>
            <p style="margin: 15px 20px;"><strong>Địa chỉ giao nhận:</strong> ${data.deliveryAddress}</p>
            <p style="margin: 15px 20px;"><strong>Người nhận:</strong> ${data.receiverName}</p>
            <p style="margin: 15px 20px;"><strong>Số điện thoại người nhận:</strong> ${data.receiverPhone}</p>
          </div>
          <p style="text-align: center; margin-top: -20px; margin-bottom: 50px;">
 <a href="tel:${data.senderPhone}" style="display: inline-block; width: 280px; box-sizing: border-box; background-color: #1a73e8; color: #ffffff; padding: 12px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">GỌI NHANH CHO KHÁCH HÀNG</a>          </p>
        </div>
    `;
  }
}
