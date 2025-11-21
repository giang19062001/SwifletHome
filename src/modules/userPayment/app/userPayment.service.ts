import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message.helper';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserPaymentAppRepository } from './userPayment.repository';
import { CreateUserPaymentAppDto } from './userPayment.dto';
import moment from 'moment';

@Injectable()
export class UserPaymentAppService {
  private readonly SERVICE_NAME = 'UserPaymentAppService';

  constructor(
    private readonly userPaymentAppRepository: UserPaymentAppRepository,
    private readonly logger: LoggingService,
  ) {}

  async create(dto: CreateUserPaymentAppDto): Promise<number> {
    const createdAt = new Date();
    await this.userPaymentAppRepository.createHistory(dto, createdAt);
    return await this.userPaymentAppRepository.create(dto, createdAt);
  }
}
