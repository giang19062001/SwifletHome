import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = req.cookies['swf-token'];
    if (!token) return false;

    try {
      const payload = await this.authService.verifyToken(token);
      req['user'] = payload; // attach user info
      return true;
    } catch (err) {
      return false;
    }
  }
}
