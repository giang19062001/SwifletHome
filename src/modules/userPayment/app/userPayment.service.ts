import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Msg } from 'src/helpers/message';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserPaymentRepository } from './userPayment.repository';
import { CreateUserPaymentDto } from './userPayment.dto';

@Injectable()
export class UserPaymentService {
  private readonly SERVICE_NAME = 'UserPaymentService';

  constructor(
    private readonly userPaymentRepository: UserPaymentRepository,
    private readonly logger: LoggingService,
  ) {}

  async create(dto: CreateUserPaymentDto): Promise<number> {
    const createdAt = new Date()
    await this.userPaymentRepository.createHistory(dto, createdAt);
    return await this.userPaymentRepository.create(dto, createdAt);
  }
}
