import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { PurposeEnum, RequestOtpDto, VerifyOtpDto } from 'src/modules/otp/otp.dto';
import { OtpService } from 'src/modules/otp/otp.service';
import { PhoneCodeService } from 'src/modules/phoneCode/phoneCode.service';
import { UserAppService } from 'src/modules/user/app/user.service';
import { UserAppResDto } from "../../user/app/user.dto";
import { USER_CONST } from "../../user/app/user.interface";
import { AbAuthService } from '../auth.abstract';
import { AUTH_CONFIG } from '../auth.config';
import { ChangeTypeTokenDto, LoginAppDto, RegisterUserAppDto, TokenUserAppResDto, UpdateDeviceTokenDto, UpdatePasswordDto, UpdateUserDto } from './auth.dto';
import { BadRequestExceptionNumData } from 'src/filter/badRequestNumber.exception';

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
    const isPhoneCodeValid = await this.phoneCodeService.getDetail(countryCode);
    if (!isPhoneCodeValid) {
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
  async login(dto: LoginAppDto): Promise<Omit<TokenUserAppResDto, 'userPassword'> & { accessToken: string }> {
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

    // Xóa device token trùng lặp ở các record khác nếu có và unsubscribe token đó khỏi topics
    const duplicatedUsers = await this.userAppService.clearDuplicateDeviceToken(dto.deviceToken, dto.userPhone);
    if (duplicatedUsers && duplicatedUsers.length > 0) {
      await Promise.all(duplicatedUsers.map(u => 
        this.firebaseService.unsubscribeFromTopic(u.userCode, dto.deviceToken)
      ));
    }

    // Luôn cập nhật device token mỗi lần đăng nhập (kể cả token không thay đổi)
    // → bắt buộc Firebase xác nhận token còn sống, tránh trường hợp token bị Firebase
    // invalidate mà server không biết dẫn đến lỗi registration-token-not-registered
    await this.userAppService.updateDeviceToken(dto.deviceToken, dto.userPhone);

    // Unsubscribe token CŨ (chỉ khi token cũ KHÁC token mới, tức user đổi thiết bị)
    // Nếu cùng token → subscribeToTopic đã xử lý unsubscribeAll rồi, không cần gọi lại
    if (user.deviceToken && String(user.deviceToken) !== String(dto.deviceToken)) {
      await this.firebaseService.unsubscribeFromTopic(user.userCode, user.deviceToken);
    }

    // Subscribe token hiện tại vào topics (bên trong đã unsubscribeAll trước khi subscribe)
    await this.firebaseService.subscribeToTopic(user.userCode, dto.deviceToken);

    // ẩn password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload: TokenUserAppResDto = {
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
    // const isUserTypeValid = await this.userAppService.getOneUserType(dto.userTypeCode);  28-02-2026
    const userTypeKeyWord = USER_CONST.USER_TYPE.OWNER.value; // ! HARDCODE
    const isUserTypeValid = await this.userAppService.getOneUserTypeByKeyword(userTypeKeyWord);

    if (!isUserTypeValid) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.InvalidUserType}`);
      throw new BadRequestException(Msg.InvalidUserType);
    } else {
      dto.userTypeCode = isUserTypeValid.userTypeCode; // ! HARDCODE
    }
    // kiểm số phone
    const user = await this.userAppService.findByPhoneWithoutCountry(dto.userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (user) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.PhoneExistCountry(dto.countryCode)}`);
      throw new BadRequestException(Msg.PhoneExistCountry(user.countryCode));
    }

    // kiểm tra xác thực otp chưa
    const verified = await this.otpService.checkPhoneVarified(dto.userPhone, PurposeEnum.REGISTER, dto.countryCode);

    // lỗi -> chưa xác thực OTP
    if (!verified) {
      this.logger.error(logbase, `${dto.userPhone} -> ${Msg.OtpNotVerify}`);
      throw new UnauthorizedException(Msg.OtpNotVerify);
    }

    // hash -> insert thông tin KHÔNG bao gồm cả device token
    const hashedPassword = await this.hashPassword(dto.userPassword);
    const userInserted: TokenUserAppResDto | null = await this.userAppService.register({
      ...dto,
      userPassword: hashedPassword,
    });

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

    // Xóa deviceToken trùng lặp nếu có
    await this.userAppService.clearDuplicateDeviceToken(dto.deviceToken);

    const result = await this.userAppService.updateDeviceToken(dto.deviceToken, userPhone);
    return result;
  }

  async checkDuplicatePhone(userPhone: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/checkDuplicatePhone`;

    // kiểm số phone
    const phone = await this.userAppService.findByPhoneWithoutCountry(userPhone);

    // lỗi -> số điện thoại đã tồn tại
    if (phone) {
      this.logger.error(logbase, `${userPhone} -> ${Msg.PhoneExistCountry(phone.countryCode)}`);
      throw new BadRequestExceptionNumData(Msg.PhoneExistCountry(phone.countryCode));
    }

    return 1;
  }

  async findUser(userCode: string): Promise<TokenUserAppResDto | null> {
    const logbase = `${this.SERVICE_NAME}/findUser`;
    const result = await this.userAppService.findByCode(userCode);
    return result;
  }
  async getInfo(userCode: string): Promise<UserAppResDto | null> {
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
        // Chạy song song các tác vụ cleanup
        this.logger.log(logbase, `Hủy topic và reset OTP cho người dùng: ${user.userCode}...`);
        await Promise.all([
          this.firebaseService.unsubscribeFromTopic(user.userCode, user.deviceToken),
          this.otpService.resetOtp(user.userPhone, '0000', new Date(), PurposeEnum.REGISTER, user.countryCode)
        ]);

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

  async changeTypeToken(payload: TokenUserAppResDto, dto: ChangeTypeTokenDto) {
    const logbase = `${this.SERVICE_NAME}/changeTypeToken`;

    try {
      // kiểm tra loại ng dùng
      const isUserTypeValid = await this.userAppService.getOneUserType(dto.userTypeCode);
      if (!isUserTypeValid) {
        this.logger.error(logbase, `${dto.userTypeCode} -> ${Msg.InvalidUserType}`);
        throw new BadRequestException(Msg.InvalidUserType);
      }
      // loại bỏ  iat, exp
      const { iat, exp, ...cleanPayload } = payload;

      // ghi đè userTypeCode và userTypeKeyWord
      const newPayload = {
        ...cleanPayload,
        userTypeCode: dto.userTypeCode,
        userTypeKeyWord: isUserTypeValid.userTypeKeyWord,
      };
      this.logger.log(logbase, `Thay đổi ${payload.userTypeKeyWord} sang ${isUserTypeValid.userTypeKeyWord} của user(${payload.userCode})`);

      // ky lại token mới
      const accessToken = this.signToken(newPayload, YnEnum.Y);
      return { ...newPayload, accessToken: accessToken }
    } catch (err) {
      this.logger.error(logbase, err.message);
      throw new UnauthorizedException(Msg.TokenInvalid);
    }
  }

  async requestOtp(dto: RequestOtpDto): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/requestOtp`;

    await this.verifyPhoneBeforeOtp(dto.userPhone, dto.purpose, dto.countryCode);
    return await this.otpService.generateOtp(dto);
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<boolean> {
    const logbase = `${this.SERVICE_NAME}/requestOtp`;
    await this.verifyPhoneBeforeOtp(dto.userPhone, dto.purpose, dto.countryCode);
    return await this.otpService.verifyOtp(dto);
  }

  signToken(payload: TokenUserAppResDto, isSave: YnEnum) {
    // bỏ iat và exp ra khỏi payload để tránh xung đột với expiresIn
    const { iat, exp, ...cleanPayload } = payload as any;

    let expiresIn: JwtSignOptions['expiresIn'];

    if (isSave === YnEnum.Y) {
      expiresIn = AUTH_CONFIG.EXPIRED_APP_SAVE; // '365d'
    } else {
      expiresIn = AUTH_CONFIG.EXPIRED_APP_NONE_SAVE; // '7d'
    }

    return this.jwtService.sign(cleanPayload, { expiresIn });
  }
  verifyToken(token: string) {
    const logbase = `${this.SERVICE_NAME}/verifyToken`;

    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (err) {
      this.logger.error(logbase, err.message);
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
  }

  async logout(user: TokenUserAppResDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/logout`;
    try {
      this.logger.log(logbase, `Người dùng ${user.userCode} đăng xuất. Xóa deviceToken và unsubscribe topics.`);
      
      // Chạy song song: unsubscribe topic và xóa deviceToken trong DB
      await Promise.all([
        this.firebaseService.unsubscribeFromTopic(user.userCode, user.deviceToken),
        this.userAppService.clearDuplicateDeviceToken(user.deviceToken)
      ]);

      return 1;
    } catch (error) {
      this.logger.error(logbase, error.message);
      return 0;
    }
  }
}
