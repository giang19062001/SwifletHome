import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AUTH_CONFIG } from '../auth.config';
import { LoginAdminDto } from './auth.dto';
import { AuthAdminService } from './auth.service';

@ApiTags('admin/auth')
@Controller('/api/admin/auth')
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  @ApiBody({
    description: `**cookies:** ${AUTH_CONFIG.TOKEN_NAME}`,
    type: LoginAdminDto,
  })
  @Throttle({ sensitive: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginAdminDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authAdminService.login(dto);

    // save token into cookie
    res.cookie(AUTH_CONFIG.TOKEN_NAME, user.accessToken, AUTH_CONFIG.COOKIE_ADMIN_CONFIG);
    // hide token
    const { accessToken, ...userWithoutToken } = user;
    // save user into session server to EJS render
    req.session.user = userWithoutToken;
    return user;
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    // clear cookie token
    res.clearCookie(AUTH_CONFIG.TOKEN_NAME);

    // cancel session
    req.session.destroy((err) => {
      // Redirect về trang login
      res.redirect('/');
    });
  }
}
