import { CanActivate, ExecutionContext, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthAdminService } from './auth.service';
import { AUTH_CONFIG, PUBLIC_ROUTERS } from 'src/helpers/const.helper';

@Injectable()
export class PageAuthAdminGuard implements CanActivate {
  LOGIN_ROUTER: string = '/';
  MAIN_ROUTER: string = "/dashboard/main";

  constructor(private readonly authAdminService: AuthAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const token = req.cookies[AUTH_CONFIG.TOKEN_NAME];

    if (!token) {
      // ko có token
      if (req.originalUrl === this.LOGIN_ROUTER || PUBLIC_ROUTERS.includes(req.originalUrl)) {
        // đang ở trang đăng nhập
        return true;
      } else {
        //ở trang khác => redirect to về lại trang đăng nhập
        res.redirect(this.LOGIN_ROUTER);
        return false;
      }
    } else {
      // have token
      try {
        const payload = await this.authAdminService.verifyToken(token);
        req.session.user = payload; // lưu user vào session server để EJS render

        if (req.originalUrl === this.LOGIN_ROUTER) {
          //đang ở trang đăng nhập
          res.redirect(this.MAIN_ROUTER);
          return false;
        } else {
          //ở trang khác => => next()
          return true;
        }
      } catch (err) {
        // token invalid => về lại trang đăng nhập
        res.redirect(this.LOGIN_ROUTER);
        return false;
      }
    }
  }
}
