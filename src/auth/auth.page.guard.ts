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
      res.redirect('/'); // havenot login yet
      return false;
    }

    try {
      const payload = await this.authService.verifyToken(token);
      req.session.user = payload; // save user into session server to EJS render

      return true;
    } catch (err) {
      res.redirect('/'); // token invalid => redirect
      return false;
    }
  }
}
