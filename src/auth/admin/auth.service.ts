import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { IUserAuth } from './auth.interface';
import { AuthLoginDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { messageErr } from 'src/common/helper/message';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}
  async login(dto: AuthLoginDto): Promise<Omit<IUserAuth, 'userPassword'>> {
    const user = await this.authRepository.findByUsername(dto.userId);

    if (!user) {
      throw new UnauthorizedException(messageErr.accountWrong);
    }

    const isPasswordValid = await bcrypt.compare(
      dto.userPassword,
      user.userPassword,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(messageErr.accountWrong);
    }

    if (user.isActive === 'N') {
      throw new ForbiddenException(messageErr.accountBlock);
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
      throw new UnauthorizedException('Invalid token');
    }
  }
}
