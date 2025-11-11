import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OtpRepository } from './otp.repository';

@Injectable()
export class OtpService {
  private readonly OTP_EXPIRY_MINUTES = 1;
  private readonly MAX_ATTEMPTS = 5;

  constructor(private readonly otpRepository: OtpRepository) {}

  async generateOtp(phoneNumber: string): Promise<string> {
    // Xóa các OTP cũ của số điện thoại này
    await this.otpRepository.deleteOtpsByPhoneNumber(phoneNumber);

    // Tạo mã OTP 6 chữ số
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Thời gian hết hạn: 1 phút
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.otpRepository.createOtp({
      phoneNumber,
      otpCode,
      expiresAt,
    });

    // TODO: Tích hợp với Firebase OTP để gửi SMS
    // await this.firebaseService.sendSMS(phoneNumber, otpCode);

    console.log(`OTP for ${phoneNumber}: ${otpCode}`); // For development

    return otpCode;
  }

  async verifyOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
    const otp = await this.otpRepository.findValidOtp(phoneNumber);

    console.log("otp", otp);
    if (!otp) {
      throw new BadRequestException('OTP không tồn tại hoặc đã hết hạn');
    }

    // Kiểm tra số lần nhập
    if (otp.attemptCount >= this.MAX_ATTEMPTS) {
      throw new ForbiddenException('Đã vượt quá số lần nhập OTP cho phép');
    }

    // Tăng số lần thử
    await this.otpRepository.updateOtpAttempt(otp.seq, otp.attemptCount + 1);

    if (otp.otpCode !== otpCode) {
      const remainingAttempts = this.MAX_ATTEMPTS - (otp.attemptCount + 1);
      throw new BadRequestException(
        `Mã OTP không đúng. Còn ${remainingAttempts} lần thử.`,
      );
    }

    // Đánh dấu OTP đã sử dụng
    await this.otpRepository.markOtpAsUsed(otp.seq);

    return true;
  }
}