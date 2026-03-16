import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Msg } from 'src/helpers/message.helper';
import { TokenUserAppResDto } from "./auth.dto";
import { AuthAppService } from './auth.service';

@Injectable()
export class ApiAuthAppGuard implements CanActivate {
  constructor(private readonly authAppService: AuthAppService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException(Msg.TokenMissing);
    }

    try {
      const payload: TokenUserAppResDto = await this.authAppService.verifyToken(token);
      const checkUserHas = await this.authAppService.findUser(payload.userCode);
      if (checkUserHas) {
        req['user'] = payload;
        return true;
      } else {
        throw new ForbiddenException(Msg.TokenInvalid);
      }
    } catch {
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}
