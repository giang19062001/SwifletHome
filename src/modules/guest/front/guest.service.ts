import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { LoggingService } from 'src/common/logger/logger.service';
import { MailService } from 'src/common/mail/mail.service';
import { CreateGuestConsulationDto } from './guest.dto';
import { GuestRepository } from './guest.repository';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class GuestService {
  private readonly SERVICE_NAME = 'GuestService';

  constructor(
    private readonly guestRepository: GuestRepository,
    private readonly mailService: MailService,
    private readonly logger: LoggingService,
    private readonly configService: ConfigService,
  ) {}

  private async verifyRecaptcha(token: string): Promise<boolean> {
    const logbase = `${this.SERVICE_NAME}/verifyRecaptcha:`;
    const secret = this.configService.get<string>('KEY_CAPCHA');
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    try {
      const response = await axios.post(url);
      this.logger.log(logbase, ` URL: ${url} ==> Response: ${JSON.stringify(response.data)}`);

      return response.data?.success === true;
    } catch (error) {
      this.logger.error(`${this.SERVICE_NAME}/verifyRecaptcha`, `error: ${error.message}`);
      return false;
    }
  }

  async requestConsulation(dto: CreateGuestConsulationDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestConsulation:`;
    try {
      const { recapchav3, ...logDto } = dto;
      this.logger.log(logbase, ` DTO: ${JSON.stringify(logDto)}`);

      // Kiểm tra reCAPTCHA v3 trước khi thực hiện action
      const isCaptchaValid = await this.verifyRecaptcha(dto.recapchav3);
      if (!isCaptchaValid) {
        throw new BadRequestException({message: Msg.CapchaInvalid, data: 0});
      }

      const result = await this.guestRepository.create(dto);

      // Gửi email thông báo
      if (result > 0) {
        this.mailService.sendGuestConsultationEmail(dto);
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, `error: ${error.message}`);
      throw error;
    }
  }
}
