import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthAdminRepository } from './auth.repository';
import { IUserAdmin } from './auth.interface';
import { LoginAdminDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { MsgErr } from 'src/helpers/message';

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly authAdminRepository: AuthAdminRepository,
    private readonly jwtService: JwtService,
  ) {}
  async login(dto: LoginAdminDto): Promise<Omit<IUserAdmin, 'userPassword'>> {
    const user = await this.authAdminRepository.findByUsername(dto.userId);

    if (!user) {
      throw new UnauthorizedException(MsgErr.AccountLoginWrong);
    }

    const isPasswordValid = await bcrypt.compare(
      dto.userPassword,
      user.userPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(MsgErr.AccountLoginWrong);
    }

    if (user.isActive === 'N') {
      throw new ForbiddenException(MsgErr.AccountLoginBlock);
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
      throw new UnauthorizedException(MsgErr.TokenInvalid);
    }
  }
}
