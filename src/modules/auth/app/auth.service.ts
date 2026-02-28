import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
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
import { AUTH_CONFIG } from '../auth.config';
import { YnEnum } from 'src/interfaces/admin.interface';
import { PhoneCodeService } from 'src/modules/phoneCode/phoneCode.service';

@Injectable()
export class AuthAppService extends AbAuthService {
  private readonly SERVICE_NAME = 'AuthAppService';

  constructor(
    private readonly userAppService: UserAppService,
    private readonly firebaseService: FirebaseService,
    private readonly phoneCodeService: PhoneCodeService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
    private readonly logger: LoggingService,
  ) {
    super();
  }

  private async verifyPhoneBeforeOtp(userPhone: string, purpose: string, countryCode: string) {
    const logbase = `${this.SERVICE_NAME}/verifyPhoneBeforeOtp`;
    // kiểm tra mã phone code hợp lệ hay ko
    const isPhoneCodeValid = await this.phoneCodeService.getDetail(countryCode)
    if(!isPhoneCodeValid){
        this.logger.error(logbase, `${userPhone} -> ${Msg.InvalidPhoneCode}`);
        throw new BadRequestException(Msg.InvalidPhoneCode);
    }
    // nếu đăng ký mới cần kiểm tra số điện thoại đã được sử dụng hay chưa
    if (purpose == PurposeEnum.REGISTER) {
      const phone = await this.userAppService.findByPhone(userPhone, countryCode);

      // lỗi -> số điện thoại đã tồn tại -> không thể tạo mới nữa -> ko phải gửi sms xác thực nữa
      if (phone) {
        this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneExistForNew}`);
        throw new BadRequestException(Msg.PhoneExistForNew);
      }
    }

    // quên password
    if (purpose == PurposeEnum.FORGOT_PASSWORD) {
      const phone = await this.userAppService.findByPhone(userPhone, countryCode);

      // lỗi -> số điện thoại không tồn tại -> không thể đổi mật khẩu -> ko phải gửi sms xác thực nữa
      if (!phone) {
        this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
        throw new BadRequestException(Msg.PhoneNotExist);
      }
    }
  }
  async login(dto: LoginAppDto): Promise<Omit<ITokenUserApp, 'userPassword'> & { accessToken: string }> {
    const logbase = `${this.SERVICE_NAME}/login`;

    const user = await this.userAppService.findByPhone(dto.userPhone, dto.countryCode);

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

    // Chỉnh sửa lại device token mỗi lần đăng nhập (nếu khác)
    if (String(user.deviceToken) !== String(dto.deviceToken)) {
      // cập nhập token mới
      await this.userAppService.updateDeviceToken(dto.deviceToken, dto.userPhone);
      // unscribe topic cho token cũ
      await this.firebaseService.unsubscribeFromTopic(user.userCode, user.deviceToken);
      // kiểm tra va đăng ký thêm ~ topic mới nếu có và subcribe lại topic cũ với devicetoken mới
      const isNewOrChange = true;
      await this.firebaseService.subscribeToTopic(user.userCode, dto.deviceToken, isNewOrChange);
    } else {
      // kiểm tra va đăng ký thêm ~ topic mới nếu có
      const isNewOrChange = false;
      await this.firebaseService.subscribeToTopic(user.userCode, dto.deviceToken, isNewOrChange);
    }

    // ẩn password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload = {
      ...userWithoutPassword,
      deviceToken: dto.deviceToken,
    };
    // const accessToken = this.jwtService.sign(payload);
    const accessToken = this.signToken(payload, dto.isSave);

    return {
      ...userWithoutPassword,
      accessToken,
    };
  }

  async register(dto: RegisterUserAppDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/register`;

    // kiểm tra loại ng dùng
    const isCountryValid = await this.userAppService.getOneUserType(dto.userTypeCode);
    if (!isCountryValid) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.InvalidUserType}`);
      throw new BadRequestException(Msg.InvalidUserType);
    }
    // kiểm số phone
    const user = await this.userAppService.findByPhoneWithoutCountry(dto.userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (user) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.PhoneExistCountry + dto.countryCode}`);
      throw new BadRequestException(Msg.PhoneExistCountry + user.countryCode);
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(dto.userPhone, PurposeEnum.REGISTER, dto.countryCode);

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
      const isNewOrChange = true;
      await this.firebaseService.subscribeToTopic(userInserted.userCode, userInserted.deviceToken, isNewOrChange);
    }

    this.logger.log(logbase, `${dto.userPhone} -> ${userInserted ? Msg.RegisterAccountOk : Msg.RegisterAccountErr}`);
    return userInserted ? 1 : 0;
  }

  async update(dto: UpdateUserDto, userPhone: string, userCode: string, countryCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/update`;

    const user = await this.userAppService.findByPhone(userPhone, countryCode);

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
    const user = await this.userAppService.findByPhone(userPhone, dto.countryCode);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(userPhone, PurposeEnum.FORGOT_PASSWORD, dto.countryCode);

    // lỗi -> chưa xác thực OTP
    if (!verified) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.OtpNotVerify}`);
      throw new UnauthorizedException(Msg.OtpNotVerify);
    }

    // hash -> update pasword
    const hashedNewPassword = await this.hashPassword(dto.newPassword);
    const result = await this.userAppService.updatePassword(hashedNewPassword, userPhone);

    // reset thông tin OTP của password để lần tiếp theo muốn đổi password lần nữa phải xác thực lại OTP
    await this.otpService.resetOtp(userPhone, '0000', new Date(), PurposeEnum.FORGOT_PASSWORD, dto.countryCode);

    this.logger.log(logbase, `${userPhone} -> ${result ? Msg.PasswordChangeOk : Msg.PasswordChangeErr}`);
    return result;
  }

  async updateDeviceToken(dto: UpdateDeviceTokenDto, userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/updateDeviceToken`;

    const user = await this.userAppService.findByPhone(userPhone, dto.countryCode);

    // tài khoản của sđt không tồn tại -> không thể update
    if (!user) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneNotExist}`);
      throw new BadRequestException(Msg.PhoneNotExist);
    }

    const result = await this.userAppService.updateDeviceToken(dto.deviceToken, userPhone);
    return result;
  }

  async checkDuplicatePhone(userPhone: string, countryCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/checkDuplicatePhone`;
    const phone = await this.userAppService.findByPhone(userPhone, countryCode);

    // lỗi -> số điện thoại đã tồn tại
    if (phone) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneExist}`);
      return 0;
    }
    return 1;
  }

  async findUser(userCode: string): Promise<ITokenUserApp | null> {
    const logbase = `${this.SERVICE_NAME}/findUser`;
    const result = await this.userAppService.findByCode(userCode);
    return result;
  }
  async getInfo(userCode: string): Promise<IUserApp | null> {
    const logbase = `${this.SERVICE_NAME}/getInfo`;

    const result = await this.userAppService.getInfo(userCode);
    this.logger.log(logbase, `Thông tin người dùng: ${result && JSON.stringify({ userName: result.userName, packageName: result.packageName, packageRemainDay: result.packageRemainDay })}`);

    return result;
  }

  async deleteAccount(userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/deleteAccount`;
    try {
      const user = await this.userAppService.findByCode(userCode);
      let result = 0;
      if (user) {
        // unscribe topic cho user chuẩn bị xóa
        this.logger.log(logbase, `Hủy topic cho người dùng: ${user.userCode}...`);
        await this.firebaseService.unsubscribeFromTopic(user.userCode, user.deviceToken);

        // reset thông tin OTP
        await this.otpService.resetOtp(user.userPhone, '0000', new Date(), PurposeEnum.REGISTER, user.countryCode);

        // xóa user ở bảng chính, insert user đó vào bảng xóa
        this.logger.log(logbase, `Xóa thông tin người dùng: ${JSON.stringify(user)}`);
        result = await this.userAppService.deleteAccount(user.userCode, user);
      }

      return result;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  async requestOtp(dto: RequestOtpDto): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/requestOtp`;
    this.logger.log(logbase, `${JSON.stringify(dto)}`);

    await this.verifyPhoneBeforeOtp(dto.userPhone, dto.purpose, dto.countryCode);
    return await this.otpService.generateOtp(dto);
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    const logbase = `${this.SERVICE_NAME}/requestOtp`;
    this.logger.log(logbase, `${JSON.stringify(dto)}`);
    await this.verifyPhoneBeforeOtp(dto.userPhone, dto.purpose, dto.countryCode);
    return await this.otpService.verifyOtp(dto);
  }

  signToken(payload: any, isSave: YnEnum) {
    let expiresIn: JwtSignOptions['expiresIn'];

    if (isSave === YnEnum.Y) {
      expiresIn = AUTH_CONFIG.EXPIRED_APP_SAVE; // '365d'
    } else if (isSave === YnEnum.N) {
      expiresIn = AUTH_CONFIG.EXPIRED_APP_NONE_SAVE; // '7d'
    } else {
      expiresIn = AUTH_CONFIG.EXPIRED_APP_NONE_SAVE; // '7d'
    }

    return this.jwtService.sign(payload, { expiresIn });
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
