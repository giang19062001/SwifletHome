import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { Request } from 'express';
import { AuthAdminService } from './auth.service';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class ApiAuthAdminGuard implements CanActivate {
  constructor(private readonly authAdminService: AuthAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException(Msg.TokenMissing);
    }

    try {
      const payload = await this.authAdminService.verifyToken(token);
      req['user'] = payload;
      return true;
    } catch {
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}
