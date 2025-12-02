import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Msg } from 'src/helpers/message.helper';
import { LoginAppDto, RegisterUserAppDto, UpdateDeviceTokenDto, UpdatePasswordDto, UpdateUserDto } from './auth.dto';
import { OtpService } from 'src/modules/otp/otp.service';
import { PurposeEnum, RequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserAppService } from 'src/modules/user/app/user.service';
import { AbAuthService } from '../auth.abstract';
import { ITokenUserApp } from './auth.interface';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { IUserApp } from 'src/modules/user/app/user.interface';

@Injectable()
export class AuthAppService extends AbAuthService {
  private readonly SERVICE_NAME = 'AuthAppService';

  constructor(
    private readonly userAppService: UserAppService,
    private readonly firebaseService: FirebaseService,
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
  async login(dto: LoginAppDto): Promise<Omit<ITokenUserApp, 'userPassword'> & { accessToken: string }> {
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

    // Chỉnh sửa lại device mỗi lần đăng nhập
    await this.userAppService.updateDeviceToken(dto.deviceToken, dto.userPhone);

    // kiểm tra va re-subcribe lại topic mỗi lần đăng nhập
    await this.firebaseService.subscribeToTopic(user.userCode, dto.deviceToken);

    // ẩn password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload = {
      ...userWithoutPassword,
      deviceToken: dto.deviceToken,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      ...userWithoutPassword,
      accessToken,
    };
  }

  async register(dto: RegisterUserAppDto): Promise<number> {
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
    const hashedPassword = await this.hashPassword(dto.userPassword);
    const userInserted: ITokenUserApp | null = await this.userAppService.register({
      ...dto,
      userPassword: hashedPassword,
    });

    if (userInserted) {
      // đăng ký topic cho push
      await this.firebaseService.subscribeToTopic(userInserted.deviceToken, userInserted.userCode);
    }

    this.logger.log(logbase, `${dto.userPhone} -> ${userInserted ? Msg.RegisterOk : Msg.RegisterErr}`);
    return userInserted ? 1 : 0;
  }

  async update(dto: UpdateUserDto, userPhone: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const user = await this.userAppService.findByPhone(userPhone);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    const result = await this.userAppService.update(dto.userName, userPhone, userCode);
    this.logger.log(logbase, `${userPhone} -> ${result ? Msg.UpdateOk : Msg.UpdateErr}`);

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
    const hashedNewPassword = await this.hashPassword(dto.newPassword);
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

    const result = await this.userAppService.updateDeviceToken(dto.deviceToken, userPhone);
    return result;
  }

  async checkDuplicatePhone(userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/checkDuplicatePhone`;
    const phone = await this.userAppService.findByPhone(userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (phone) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneExist}`);
      return 0;
    }
    return 1;
  }

  async getInfo(userCode: string): Promise<IUserApp | null> {
    return await this.userAppService.getInfo(userCode);
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

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  }
}
