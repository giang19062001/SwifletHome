import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginAdminDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Msg } from 'src/helpers/message.helper';
import { UserAdminService } from 'src/modules/user/admin/user.service';
import { AbAuthService } from '../auth.abstract';
import { ITokenUserAdmin } from 'src/modules/auth/admin/auth.interface';

@Injectable()
export class AuthAdminService extends AbAuthService {
  constructor(
    private readonly userAdminService: UserAdminService,
    private readonly jwtService: JwtService,
  ) {
    super();
  }
  async login(dto: LoginAdminDto): Promise<Omit<ITokenUserAdmin, 'userPassword'> & { accessToken: string }> {
    const user = await this.userAdminService.findByUserId(dto.userId);

    if (!user) {
      throw new UnauthorizedException(Msg.AccountLoginWrong);
    }

    const isPasswordValid = await bcrypt.compare(dto.userPassword, user.userPassword);

    if (!isPasswordValid) {
      throw new UnauthorizedException(Msg.AccountLoginWrong);
    }

    if (user.isActive === 'N') {
      throw new ForbiddenException(Msg.AccountLoginBlock);
    }
    // hide password
    const { userPassword, ...userWithoutPassword } = user;

    // generate token
    const payload = { userId: user.userId, userName: user.userName };
    const accessToken = this.jwtService.sign(payload);
    return { ...userWithoutPassword, accessToken };
  }
  register(dto: any): Promise<any> {
    throw new Error('Method not implemented.');
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
