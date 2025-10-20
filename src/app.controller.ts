import { AppService } from './app.service';
import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { PageAuthGuard } from './auth/auth.page.guard';

@ApiExcludeController() // hide from swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Render('pages/login')
  renderLogin() {
    return { title: 'Login', noLayout: true };
  }
  @Get('/dashboard/question')
  @UseGuards(PageAuthGuard)
  @Render('pages/question')
  renderQuestion(@Req() req: Request) {
    return { title: 'Question', noLayout: false, user: req.session.user };
  }

  @Get('/404')
  @Render('pages/404')
  render404(@Req() req: Request) {
    return { title: '404', noLayout: true, user: req.session?.user };
  }
}
