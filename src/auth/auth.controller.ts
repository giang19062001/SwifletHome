import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

@ApiTags('auth')
@Controller('/api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    type: AuthLoginDto,
  })
  @Post('login')
  async login(
    @Body() dto: AuthLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.login(dto);

    // save token into cookie
    res.cookie('swf-token', user.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hrs
    });
    // hide token
    const { accessToken, ...userWithoutToken } = user;
    // save user into session server to EJS render
    req.session.user = userWithoutToken;
    return res.status(HttpStatus.OK).json(userWithoutToken);
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    // clear cookie token
    res.clearCookie('swf-token');

    // cancel session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // Redirect về trang login
      res.redirect('/');
    });
  }
}
