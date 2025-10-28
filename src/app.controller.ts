import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { AppService } from './app.service';
import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { PageAuthGuard } from './modules/auth/admin/auth.page.guard';

@ApiExcludeController() // hide from swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(PageAuthGuard)
  @Render('pages/login')
  renderLogin() {
    return { title: 'Login', isLayout: false };
  }

  @Get('/dashboard/question/category')
  @UseGuards(PageAuthGuard)
  @Render('pages/category-question')
  renderCateQuestion(@Req() req: Request) {
    return {
      title: 'Category of question',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/question/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/question')
  renderQuestion(@Req() req: Request) {
    return { title: 'Question', isLayout: true, user: req.session.user };
  }

  @Get('/dashboard/answer/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer')
  renderAnswer(@Req() req: Request) {
    return { title: 'Answer', isLayout: true, user: req.session.user };
  }
  @Get('/dashboard/answer/create')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer-create')
  async renderCreateAnswer(@Req() req: Request) {
    const values = await this.appService.renderCreateAnswer();
    return {
      title: 'Creating Answer',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  @Get('/dashboard/answer/update/:id')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer-update')
  async renderAnswerUpdate(@Req() req: Request) {
    const values = await this.appService.renderAnswerUpdate(req.params.id);
    return {
      title: 'Answer',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  @Get('/dashboard/home/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/home')
  renderHome(@Req() req: Request) {
    return { title: 'Swiftlet Home', isLayout: true, user: req.session.user };
  }

  @Get('/404')
  @Render('pages/404')
  render404(@Req() req: Request) {
    return { title: '404', isLayout: false, user: req.session?.user };
  }
}
