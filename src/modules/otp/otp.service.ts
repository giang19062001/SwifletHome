import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OtpRepository } from './otp.repository';
import { Msg } from 'src/helpers/message.helper';
import { PurposeEnum, RequestOtpDto, VerifyOtpDto } from './otp.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { QUERY_HELPER } from 'src/helpers/const.helper';
@Injectable()
export class OtpService {
  private readonly SERVICE_NAME = 'OtpService';

  constructor(
    private readonly otpRepository: OtpRepository,
    private readonly logger: LoggingService,
  ) {}

  async checkPhoneVarified(userPhone: string, purpose: string, countryCode: string): Promise<boolean> {
    const result = await this.otpRepository.checkPhoneVarified(userPhone, purpose, countryCode);
    if (result) {
      return true;
    }
    return false;
  }

  async resetOtp(userPhone: string, otpCode: string, expiresAt: Date, purpose: string, countryCode: string): Promise<boolean> {
    await this.otpRepository.resetOtp(userPhone, otpCode, expiresAt, purpose, countryCode);
    return true;
  }
  async generateOtp(dto: RequestOtpDto): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/generateOtp`;

    // kiểm tra sdt này có otp chưa
    const otpExist = await this.otpRepository.findOtpExist(dto.userPhone, dto.countryCode);

    // Tạo mã OTP 4 chữ số
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Thời gian hết hạn: 1 phút
    const expiresAt = new Date(Date.now() + QUERY_HELPER.OTP_EXPIRY_MINUTES * 60 * 1000);

    // nếu otp của sdt này đã có -> update ( ko xóa )
    if (otpExist) {
      await this.otpRepository.resetOtp(dto.userPhone, otpCode, expiresAt, dto.purpose, dto.countryCode);
    } else {
      // insert
      await this.otpRepository.createOtp(dto.userPhone, otpCode, expiresAt, dto.purpose, dto.countryCode);
    }

    // TODO: GỌI DỊCH VỤ SMS
    this.logger.log(logbase, `OTP for ${dto.userPhone}: ${otpCode}`);
    return otpCode;
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    const logbase = `${this.SERVICE_NAME}/verifyOtp`;

    const otp = await this.otpRepository.findValidOtp(dto.userPhone, dto.purpose, dto.countryCode);

    // không tồn tại otp hợp lệ nào hiện có của số điện thoại này trong db
    if (!otp) {
      this.logger.error(logbase, `OTP for ${dto.userPhone}: ${Msg.OtpExpire}`);
      throw new BadRequestException({
        message: Msg.OtpExpire,
        data: 0,
      });
    }

    // Kiểm tra số lần nhập
    if (otp.attemptCount >= QUERY_HELPER.OTP_MAX_ATTEMPTS) {
      this.logger.error(logbase, `OTP for ${dto.userPhone}: ${Msg.OtpOvertake}`);
      throw new ForbiddenException({
        message: Msg.OtpOvertake,
        data: 0,
      });
    }

    // Tăng số lần thử
    await this.otpRepository.updateOtpAttempt(otp.seq, otp.attemptCount + 1);

    // kiểm tra otp có khớp với otp lưu trong db => không khớp
    if (otp.otpCode !== dto.otpCode) {
      const remainingAttempts = QUERY_HELPER.OTP_MAX_ATTEMPTS - (otp.attemptCount + 1);
      this.logger.error(logbase, `OTP for ${dto.userPhone}: ${Msg.OtpRemainAttempt(remainingAttempts)}`);
      throw new BadRequestException({
        message: Msg.OtpRemainAttempt(remainingAttempts),
        data: 0,
      });
    }

    // Khớp -> Đánh dấu OTP đã sử dụng
    this.logger.log(logbase, `OTP for ${dto.userPhone}: ${Msg.OtpValid}`);
    await this.otpRepository.updateOtpAsUsed(otp.seq);
    return true;
  }
}
