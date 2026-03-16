import { Module } from '@nestjs/common';
import PhoneCodeController from './phoneCode.controller';
import { PhoneCodeRepository } from './phoneCode.repository';
import { PhoneCodeService } from './phoneCode.service';

@Module({
  imports: [],
  controllers: [PhoneCodeController],
  providers: [PhoneCodeService, PhoneCodeRepository],
  exports: [PhoneCodeService]
})
export class PhoneCodeModule {}