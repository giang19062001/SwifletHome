import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { Msg } from 'src/helpers/message';
import { PurposeEnum, RequestOtpDto, VerifyOtpDto } from './otp.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WinstonLoggerService } from 'src/logger/logger.service';
@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 1;
  private readonly MAX_ATTEMPTS = 5;
  private readonly SERVICE_NAME = 'OtpService';

  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly logger: WinstonLoggerService,
  ) {}

  // CRON JOB: Dọn dẹp OTP hết hạn + quá lượt thử
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanup-expired-otps',
    timeZone: 'Asia/Ho_Chi_Minh', // ! HCM
  })
  async cleanupExpiredOtps() {
    const logbase = `${this.SERVICE_NAME}/cleanupExpiredOtps:`;
    this.logger.log(logbase, 'Starting clean up expired OTPs...');
    await this.otpRepository.cleanupExpiredOtps();
    this.logger.log(logbase, 'The expired OTPs was deleted');
  }

  async checkPhoneVarified(userPhone: string, purpose: string): Promise<boolean> {
    const result = await this.otpRepository.checkPhoneVarified(userPhone, purpose);
    if (result) {
      return true;
    }
    return false;
  }

  async deleteOtp(userPhone: string, purpose: string): Promise<boolean> {
    await this.otpRepository.deleteOtp(userPhone, purpose);
    return true;
  }
  async generateOtp(dto: RequestOtpDto): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/generateOtp`;
    // Xóa các OTP cũ của số điện thoại này
    await this.otpRepository.deleteOtp(dto.userPhone, dto.purpose);

    // Tạo mã OTP 4 chữ số
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Thời gian hết hạn: 1 phút
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.otpRepository.createOtp(dto.userPhone, otpCode, expiresAt, dto.purpose);

    // TODO: GỌI DỊCH VỤ SMS

    this.logger.log(logbase, `OTP for ${dto.userPhone}: ${otpCode}`);

    return otpCode;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    const logbase = `${this.SERVICE_NAME}/verifyOtp`;

    const otp = await this.otpRepository.findValidOtp(dto.userPhone, dto.purpose);
    this.logger.log(logbase, `Otp -> ${JSON.stringify(otp)}`);

    // không tồn tại otp hợp lệ nào hiện có của số điện thoại này trong db
    if (!otp) {
      throw new BadRequestException(Msg.OtpExpire);
    }

    // Kiểm tra số lần nhập
    if (otp.attemptCount >= this.MAX_ATTEMPTS) {
      throw new ForbiddenException(Msg.OtpOvertake);
    }

    // Tăng số lần thử
    await this.otpRepository.updateOtpAttempt(otp.seq, otp.attemptCount + 1);

    // kiểm tra otp có khớp với otp lưu trong db => không khớp
    if (otp.otpCode !== dto.otpCode) {
      const remainingAttempts = this.MAX_ATTEMPTS - (otp.attemptCount + 1);
      throw new BadRequestException(Msg.OtpRemainAttempt(remainingAttempts));
    }

    // Khớp -> Đánh dấu OTP đã sử dụng
    await this.otpRepository.updateOtpAsUsed(otp.seq);
    return true;
  }
}
