import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthAdminService } from './auth.service';

@Injectable()
export class ApiAuthAdminGuard implements CanActivate {
  constructor(private readonly authAdminService: AuthAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.authAdminService.verifyToken(token);
      req['user'] = payload;
      return true;
    } catch {
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}
