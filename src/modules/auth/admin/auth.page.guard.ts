import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthAdminService } from './auth.service';
import { AUTH_CONFIG } from 'src/helpers/const.helper';

@Injectable()
export class PageAuthAdminGuard implements CanActivate {
  constructor(private readonly authAdminService: AuthAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const token = req.cookies[AUTH_CONFIG.TOKEN_NAME];

    if (!token) {
      // no token
      if (req.originalUrl === '/') {
        // in login page
        return true;
      } else {
        // in another page => redirect to login page
        res.redirect('/');
        return false;
      }
    } else {
      // have token
      try {
        const payload = await this.authAdminService.verifyToken(token);
        req.session.user = payload; // save user into session server to EJS render

        if (req.originalUrl === '/') {
          // in login page
          res.redirect('/dashboard/main');
          return false;
        } else {
          // in another page => next()
          return true;
        }
      } catch (err) {
        // token invalid => login page
        res.redirect('/');
        return false;
      }
    }
  }
}
