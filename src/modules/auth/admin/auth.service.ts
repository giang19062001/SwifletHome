import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserAuthAdmin } from './auth.interface';
import { LoginAdminDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Msg } from 'src/helpers/message';
import { UserAdminService } from 'src/modules/user/admin/user.service';

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly userAdminService: UserAdminService,
    private readonly jwtService: JwtService,
  ) {}
  async login(dto: LoginAdminDto): Promise<Omit<IUserAuthAdmin, 'userPassword'>> {
    const user = await this.userAdminService.findByUserId(dto.userId);

    if (!user) {
      throw new UnauthorizedException(Msg.AccountLoginWrong);
    }

    const isPasswordValid = await bcrypt.compare(
      dto.userPassword,
      user.userPassword,
    );

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

  verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (err) {
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}
