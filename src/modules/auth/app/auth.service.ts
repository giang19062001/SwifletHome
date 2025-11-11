import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthAppRepository } from './auth.repository';
import { IUserApp } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { MsgErr } from 'src/helpers/message';
import { LoginAppDto, RegisterAppDto } from './auth.dto';
import { hashPassword } from 'src/helpers/auth';

@Injectable()
export class AuthAppService {
  constructor(
    private readonly AuthAppRepository: AuthAppRepository,
    private readonly jwtService: JwtService,
  ) {}
  async login(dto: LoginAppDto): Promise<Omit<IUserApp, 'userPassword'>> {
    const user = await this.AuthAppRepository.findByPhone(dto.userPhone);
    if (!user) {
      throw new UnauthorizedException(MsgErr.PhoneLoginWrong);
    }

    const isPasswordValid = await bcrypt.compare(dto.userPassword, user.userPassword);

    // sai mật khẩu
    if (!isPasswordValid) {
      throw new UnauthorizedException(MsgErr.PhoneLoginWrong);
    }

    // tài khoản bị khóa
    if (user.isActive === 'N') {
      throw new ForbiddenException(MsgErr.AccountLoginBlock);
    }

    // cập nhập lại device mỗi lần đăng nhập
    await this.AuthAppRepository.updateDevice(dto.userDevice, dto.userPhone);
    // ẩn password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload = { userCode: user.userCode, userName: user.userName, userPhone: user.userPhone, userDevice: dto.userDevice };
    const accessToken = this.jwtService.sign(payload);
    return { ...userWithoutPassword, userDevice: dto.userDevice, accessToken };
  }

  async register(dto: RegisterAppDto): Promise<number> {
    const user = await this.AuthAppRepository.findByPhone(dto.userPhone);

    // tài khoản đã tồn tại
    if (user) {
      throw new BadRequestException(MsgErr.PhoneExist);
    }

    // hash
    const hashedPassword = await hashPassword(dto.userPassword);
    const result = await this.AuthAppRepository.create({
      ...dto,
      userPassword: hashedPassword,
    });

    return result;
  }

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (err) {
      throw new UnauthorizedException(MsgErr.TokenInvalid);
    }
  }
}
