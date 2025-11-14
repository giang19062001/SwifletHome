import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Msg } from 'src/helpers/message';
import { LoginAppDto, RegisterAppDto, UpdateDeviceTokenDto, UpdatePasswordDto } from './auth.dto';
import { hashPassword } from 'src/helpers/auth';
import { OtpService } from 'src/modules/otp/otp.service';
import { PurposeEnum, RequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { IUserAuthApp } from './auth.interface';
import { UserAppService } from 'src/modules/user/app/user.service';
import { AbAuthService } from '../auth.abstract';

@Injectable()
export class AuthAppService extends AbAuthService{
  private readonly SERVICE_NAME = 'AuthAppService';

  constructor(
    private readonly userAppService: UserAppService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly logger: LoggingService,
  ) {
    super();
  }

  private async verifyPhoneBeforeOtp(userPhone: string, purpose: string) {
    const logbase = `${this.SERVICE_NAME}/verifyPhoneBeforeOtp`;

    // nếu đăng ký mới cần kiểm tra số điện thoại đã được sử dụng hay chưa
    if (purpose == 'REGISTER') {
      const phone = await this.userAppService.findByPhone(userPhone);

      // lỗi -> số điện thoại đã tồn tại -> không thể tạo mới nữa -> ko phải gửi sms xác thực nữa
      if (phone) {
        this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneExistForNew}`);
        throw new BadRequestException(Msg.PhoneExistForNew);
      }
    }

    // quên password
    if (purpose == 'FORGOT_PASSWORD') {
      const phone = await this.userAppService.findByPhone(userPhone);

      // lỗi -> số điện thoại không tồn tại -> không thể đổi mật khẩu -> ko phải gửi sms xác thực nữa
      if (!phone) {
        this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
        throw new BadRequestException(Msg.PhoneNotExist);
      }
    }
  }
  async login(dto: LoginAppDto): Promise<IUserAuthApp> {
    const logbase = `${this.SERVICE_NAME}/login`;

    const user = await this.userAppService.findByPhone(dto.userPhone);
    // số điện không tồn tại | sai
    if (!user) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.PhoneLoginWrong}`);
      throw new UnauthorizedException(Msg.PhoneLoginWrong);
    }

    const isPasswordValid = await bcrypt.compare(dto.userPassword, user.userPassword);

    // sai mật khẩu
    if (!isPasswordValid) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.PhoneLoginWrong}`);
      throw new UnauthorizedException(Msg.PhoneLoginWrong);
    }

    // tài khoản bị khóa
    if (user.isActive === 'N') {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.AccountLoginBlock}`);
      throw new ForbiddenException(Msg.AccountLoginBlock);
    }

    // cập nhập lại device mỗi lần đăng nhập
    await this.userAppService.updateDeviceToken(dto.userDevice, dto.userPhone);
    // ẩn password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload = { userCode: user.userCode, userName: user.userName, userPhone: user.userPhone, userDevice: dto.userDevice };
    const accessToken = this.jwtService.sign(payload);
    return { ...userWithoutPassword, userDevice: dto.userDevice, accessToken };
  }

  async register(dto: RegisterAppDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/register`;
    const user = await this.userAppService.findByPhone(dto.userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (user) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.PhoneExist}`);
      throw new BadRequestException(Msg.PhoneExist);
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(dto.userPhone, PurposeEnum.REGISTER);

    // lỗi -> chưa xác thực OTP
    if (!verified) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.OtpNotVerify}`);
      throw new UnauthorizedException(Msg.OtpNotVerify);
    }

    // hash -> insert thông tin bao gồm cả device token
    const hashedPassword = await hashPassword(dto.userPassword);
    const result = await this.userAppService.create({
      ...dto,
      userPassword: hashedPassword,
    });

    this.logger.log(logbase, `${dto.userPhone} -> ${result ? Msg.RegisterOk : Msg.RegisterErr}`);
    return result;
  }

  async updatePassword(dto: UpdatePasswordDto, userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/updatePassword`;
    const user = await this.userAppService.findByPhone(userPhone);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(userPhone, PurposeEnum.FORGOT_PASSWORD);

    // lỗi -> chưa xác thực OTP
    if (!verified) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.OtpNotVerify}`);
      throw new UnauthorizedException(Msg.OtpNotVerify);
    }

    // hash -> update pasword
    const hashedNewPassword = await hashPassword(dto.newPassword);
    const result = await this.userAppService.updatePassword(hashedNewPassword, userPhone);

    // reset thông tin OTP của password để lần tiếp theo muốn đổi password lần nữa phải xác thực lại OTP
    await this.otpService.resetOtp(userPhone, '0000', new Date(), PurposeEnum.FORGOT_PASSWORD);

    this.logger.log(logbase, `${userPhone} -> ${result ? Msg.PasswordChangeOk : Msg.PasswordChangeErr}`);
    return result;
  }

  async updateDeviceToken(dto: UpdateDeviceTokenDto, userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/updateDeviceToken`;

    const user = await this.userAppService.findByPhone(userPhone);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    const result = await this.userAppService.updateDeviceToken(dto.userDevice, userPhone);
    return result;
  }

  async checkDuplicatePhone(userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/checkDuplicatePhone`;
    const phone = await this.userAppService.findByPhone(userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (phone) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneExist}`);
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
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}
