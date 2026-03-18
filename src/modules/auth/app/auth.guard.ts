import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { TokenUserAppResDto } from "./auth.dto";
import { AuthAppService } from './auth.service';

@Injectable()
export class ApiAuthAppGuard implements CanActivate {
  constructor(
    private readonly authAppService: AuthAppService,
    private readonly logger: LoggingService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.error(`[AUTH] Missing token`);
      throw new UnauthorizedException(Msg.TokenMissing);
    }

    try {
      const payload: TokenUserAppResDto = await this.authAppService.verifyToken(token);
      const checkUserHas = await this.authAppService.findUser(payload.userCode);
      if (checkUserHas) {
        req['user'] = payload;
        return true;
      } else {
        this.logger.error(`[AUTH] User not found or inactive`, { userCode: payload.userCode });
        throw new ForbiddenException(Msg.TokenInvalid);
      }
    } catch (err) {
      this.logger.error(`[AUTH] Invalid token or verification failed`, { error: err.message });
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}

