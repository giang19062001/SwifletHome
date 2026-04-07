import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { MailService } from 'src/common/mail/mail.service';
import { CreateGuestConsulationDto } from './guest.dto';
import { GuestRepository } from './guest.repository';

@Injectable()
export class GuestService {
  private readonly SERVICE_NAME = 'GuestService';

  constructor(
    private readonly guestRepository: GuestRepository,
    private readonly mailService: MailService,
    private readonly logger: LoggingService,
  ) {}

  async requestConsulation(dto: CreateGuestConsulationDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestConsulation:`;
    try {
      this.logger.log(logbase,` input DTO: ${JSON.stringify(dto)}`);
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
