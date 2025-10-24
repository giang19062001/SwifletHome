import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class PageAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const token = req.cookies['swf-token'];

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
        const payload = await this.authService.verifyToken(token);
        req.session.user = payload; // save user into session server to EJS render

        if (req.originalUrl === '/') {
          // in login page
          res.redirect('/dashboard/question/list');
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
