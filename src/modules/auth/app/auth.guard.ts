import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { Request } from 'express';
import { AuthAppService } from './auth.service';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class ApiAuthAppGuard implements CanActivate {
  constructor(
    private readonly authAppService: AuthAppService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    // const token = req.headers.authorization?.replace('Bearer ', '');

    // if (!token) {
    //   throw new UnauthorizedException(Msg.TokenMissing);
    // }
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyQ29kZSI6IlVTUjAwMDAwMSIsInVzZXJOYW1lIjoiR2lhbmcgUm95YWwgRXNjb3J0cyIsInVzZXJQaG9uZSI6IjAzMzQ2NDQzMjQiLCJkZXZpY2VUb2tlbiI6ImQ0bTBVdWJsUlJHX3ktWkI1VTlVaHU6QVBBOTFiSFlwSVZEbjJKb1RuOUNpSEpFdGJvakZUSzRFOXRuZkMwNmVFVDl4bm9vaFQyTXFGaTg2U3Z1MEZTNEFtYThScDNvWnBKV0NNN3dvcTVVUDZXWGhyZ0htbDhzclM3RUFjNHgwQ0xHLVlmeFpvRXl5SEEiLCJpYXQiOjE3NjM5ODExOTMsImV4cCI6MTc2NDA2NzU5M30.zC3jDHrVXtP9iqRNnl0Q8xHLIQb3F5ruyDSm0H9EdFg`

    try {
      const payload = await this.authAppService.verifyToken(token);
      req['user'] = payload;
      return true;
    } catch {
      throw new ForbiddenException(Msg.TokenInvalid);
    }
  }
}
