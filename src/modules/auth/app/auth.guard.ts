import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { TokenEaterAppResDto, TokenUserAppResDto } from "./auth.response";
import { AuthAppService } from './auth.service';

@Injectable()
export class ApiAuthAppGuard implements CanActivate {
  constructor(
    private readonly authAppService: AuthAppService,
    private readonly logger: LoggingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      this.logger.error(`[AUTH] Missing token`);
      throw new UnauthorizedException(Msg.TokenMissing);
    }

    try {
      const payload: TokenUserAppResDto | TokenEaterAppResDto = await this.authAppService.verifyToken(token);
      // dành cho App chính
      if ('userCode' in payload) {
        const checkUserHas = await this.authAppService.findUser(payload.userCode);
        if (checkUserHas) {
          req['user'] = payload;
          return true;
        } else {
          this.logger.error(`[AUTH] User not found or inactive`, { userCode: payload.userCode });
          throw new ForbiddenException(Msg.TokenInvalid);
        }
      } else if ('eaterCode' in payload) {
        // dành cho App người ăn yến
        const checkUserHas = await this.authAppService.findEater(payload.eaterCode);
        if (checkUserHas) {
          req['user'] = payload;
          return true;
        } else {
          this.logger.error(`[AUTH] User not found or inactive`, { eaterCode: payload.eaterCode });
          throw new ForbiddenException(Msg.TokenInvalid);
        }
      } else {
        this.logger.error(`[AUTH] Invalid token or verification failed`, 'Mising userCode or eaterCode from Token');
        throw new ForbiddenException(Msg.TokenInvalid);
      }
    } catch (err) {
      this.logger.error(`[AUTH] Invalid token or verification failed`, { error: err.message });
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}
