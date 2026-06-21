import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggingService } from '../logger/logger.service';
import { EMAIL } from 'src/helpers/text.helper';
import { getGuestTemplate, getTeamTemplate, getDoctorTemplate, getSightSeeingTemplate, getRequestQrTemplate, getConsignmentTemplate } from './mail.teamplate';

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
    const html = getGuestTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_CONSULTATION, html, `GuestConsultation:${data.name}`);
  }

  async sendTeamEmail(data: any) {
    const html = getTeamTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_TEAM, html, `Team:${data.teamUserName}`);
  }

  async sendDoctorEmail(data: any) {
    const html = getDoctorTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_DOCTOR, html, `Doctor:${data.userName}`);
  }

  async sendSightSeeingEmail(data: any) {
    const html = getSightSeeingTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_SIGHTSEEING, html, `SightSeeing:${data.userName}`);
  }

  async sendRequestQrEmail(data: any) {
    const html = getRequestQrTemplate(data);
    await this.sendMail(EMAIL.SUBJECT_SEND_REQUEST_QR, html, `RequestQr:${data.userName}`);
  }

  async sendConsignmentEmail(data: any) {
    const html = getConsignmentTemplate(data);
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
}
