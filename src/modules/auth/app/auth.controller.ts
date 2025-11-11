import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { LoginAppDto, RegisterAppDto } from './auth.dto';
import { AuthAppService } from './auth.service';
import { ResponseAppInterceptor } from 'src/interceptors/response';

@ApiTags('app/auth')
@Controller('/api/app/auth')
@UseInterceptors(ResponseAppInterceptor)
export class AuthAppController {
  constructor(private readonly authAppService: AuthAppService) {}

   @ApiBody({
    type: LoginAppDto,
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginAppDto) {
    const user = await this.authAppService.login(dto);
    return user
  }

  @ApiBody({
    type: RegisterAppDto,
  })
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: RegisterAppDto) {
    const user = await this.authAppService.register(dto);
    return user
  }
}
