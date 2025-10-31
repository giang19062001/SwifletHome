import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

@ApiTags('admin/auth')
@Controller('/api/admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    description: '**cookies:** `swf-token`',
    type: AuthLoginDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AuthLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.login(dto);

    // save token into cookie
    res.cookie('swf-token', user.accessToken, {
      httpOnly: false,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hrs
    });
    // hide token
    const { accessToken, ...userWithoutToken } = user;
    // save user into session server to EJS render
    req.session.user = userWithoutToken;
    return userWithoutToken;
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    // clear cookie token
    res.clearCookie('swf-token');

    // cancel session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session: ', err);
      }
      // Redirect về trang login
      res.redirect('/');
    });
  }
}
