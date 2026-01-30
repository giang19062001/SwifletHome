import { PhoneCodeRepository } from './phoneCode.repository';
import { Module } from '@nestjs/common';
import { PhoneCodeService } from './phoneCode.service';
import PhoneCodeController from './phoneCode.controller';

@Module({
  imports: [],
  controllers: [PhoneCodeController],
  providers: [PhoneCodeService, PhoneCodeRepository],
  exports: [PhoneCodeService]
})
export class PhoneCodeModule {}