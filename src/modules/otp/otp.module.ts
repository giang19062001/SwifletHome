import { Module } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { OtpService } from './otp.service';

@Module({
  imports:[],
  providers: [OtpService, OtpRepository],
  exports: [OtpService],
})
export class OtpAppModule {}