import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthAppRepository } from './auth.repository';
import { IUserApp } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { Msg } from 'src/helpers/message';
import { LoginAppDto, RegisterAppDto, UpdateDeviceTokenDto, UpdatePasswordDto } from './auth.dto';
import { hashPassword } from 'src/helpers/auth';
import { OtpService } from 'src/modules/otp/otp.service';
import { PurposeEnum, RequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';

@Injectable()
export class AuthAppService {
  constructor(
    private readonly authAppRepository: AuthAppRepository,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  private async verifyPhoneBeforeOtp(userPhone: string, purpose: string) {
    // nếu đăng ký mới cần kiểm tra số điện thoại đã được sử dụng hay chưa
    if (purpose == 'REGISTER') {
      const phone = await this.authAppRepository.findByPhone(userPhone);

      // lỗi -> số điện thoại đã tồn tại -> không thể tạo mới nữa -> ko phải gửi sms xác thực nữa
      if (phone) {
        throw new BadRequestException(Msg.PhoneExistForNew);
      }
    }

    // quên password
    if (purpose == 'FORGOT_PASSWORD') {
      const phone = await this.authAppRepository.findByPhone(userPhone);

      // lỗi -> số điện thoại không tồn tại -> không thể đổi mật khẩu -> ko phải gửi sms xác thực nữa
      if (!phone) {
        throw new BadRequestException(Msg.PhoneNotExist);
      }
    }
  }
  async login(dto: LoginAppDto): Promise<Omit<IUserApp, 'userPassword'>> {
    const user = await this.authAppRepository.findByPhone(dto.userPhone);
    // số điện không tồn tại | sai
    if (!user) {
      throw new UnauthorizedException(Msg.PhoneLoginWrong);
    }

    const isPasswordValid = await bcrypt.compare(dto.userPassword, user.userPassword);

    // sai mật khẩu
    if (!isPasswordValid) {
      throw new UnauthorizedException(Msg.PhoneLoginWrong);
    }

    // tài khoản bị khóa
    if (user.isActive === 'N') {
      throw new ForbiddenException(Msg.AccountLoginBlock);
    }

    // cập nhập lại device mỗi lần đăng nhập
    await this.authAppRepository.updateDeviceToken(dto.userDevice, dto.userPhone);
    // ẩn password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload = { userCode: user.userCode, userName: user.userName, userPhone: user.userPhone, userDevice: dto.userDevice };
    const accessToken = this.jwtService.sign(payload);
    return { ...userWithoutPassword, userDevice: dto.userDevice, accessToken };
  }

  async register(dto: RegisterAppDto): Promise<number> {
    const user = await this.authAppRepository.findByPhone(dto.userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (user) {
      throw new BadRequestException(Msg.PhoneExist);
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(dto.userPhone, PurposeEnum.REGISTER);

    // lỗi -> chưa xác thực OTP
    if (!verified) {
      throw new UnauthorizedException(Msg.OtpNotVerify);
    }

    // hash -> insert thông tin bao gồm cả device token
    const hashedPassword = await hashPassword(dto.userPassword);
    const result = await this.authAppRepository.create({
      ...dto,
      userPassword: hashedPassword,
    });

    return result;
  }

  async updatePassword(dto: UpdatePasswordDto, userPhone: string): Promise<number> {
    const user = await this.authAppRepository.findByPhone(userPhone);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(userPhone, PurposeEnum.FORGOT_PASSWORD);

    // lỗi -> chưa xác thực OTP
    if (!verified) {
      throw new UnauthorizedException(Msg.OtpNotVerify);
    }

    // hash -> update pasword
    const hashedNewPassword = await hashPassword(dto.newPassword);
    const result = await this.authAppRepository.updatePassword(hashedNewPassword, userPhone);

    // xóa thông tin OTP của password để lần tiếp theo muốn đổi password lần nữa phải xác thực lại OTP
    await this.otpService.deleteOtp(userPhone, PurposeEnum.FORGOT_PASSWORD);
    return result;
  }

  async updateDeviceToken(dto: UpdateDeviceTokenDto, userPhone: string): Promise<number> {
    const user = await this.authAppRepository.findByPhone(userPhone);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    const result = await this.authAppRepository.updateDeviceToken(dto.userDevice, userPhone);
    return result;
  }

  async checkPhoneDuplicate(userPhone: string): Promise<number> {
    const phone = await this.authAppRepository.findByPhone(userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (phone) {
      throw new BadRequestException(Msg.PhoneExist);
    }
    return 1;
  }

  async requestOtp(dto: RequestOtpDto): Promise<string> {
    await this.verifyPhoneBeforeOtp(dto.userPhone, dto.purpose);
    return await this.otpService.generateOtp(dto);
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    await this.verifyPhoneBeforeOtp(dto.userPhone, dto.purpose);
    return await this.otpService.verifyOtp(dto);
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (err) {
      throw new UnauthorizedException(Msg.TokenInvalid);
    }
  }
}
