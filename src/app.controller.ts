import { AnswerAdminService } from './answer/admin/answer.service';
import { AppService } from './app.service';
import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { PageAuthGuard } from './auth/admin/auth.page.guard';

@ApiExcludeController() // hide from swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(PageAuthGuard)
  @Render('pages/login')
  renderLogin() {
    return { title: 'Login', noLayout: true };
  }

  @Get('/dashboard/question/category')
  @UseGuards(PageAuthGuard)
  @Render('pages/category-question')
  renderCateQuestion(@Req() req: Request) {
    return {
      title: 'Category of question',
      noLayout: false,
      user: req.session.user,
    };
  }
  @Get('/dashboard/question/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/question')
  renderQuestion(@Req() req: Request) {
    return { title: 'Question', noLayout: false, user: req.session.user };
  }

  @Get('/dashboard/answer/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer')
  renderAnswer(@Req() req: Request) {
    return { title: 'Answer', noLayout: false, user: req.session.user };
  }

  @Get('/dashboard/answer/detail/:id')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer-detail')
  async renderAnswerDetail(@Req() req: Request) {
    const answer = await this.appService.getDetailAnswer(req.params.id);
    const categoryQuestion = await this.appService.getAllCateQues();
    return {
      title: 'Answer',
      noLayout: false,
      user: req.session.user,
      content: {
        answerContent: answer?.answerContent,
        answerContentRaw: answer?.answerContentRaw,
        answerObject: answer?.answerObject,
        categoryAnsCode: answer?.categoryAnsCode,
        categoryQuestion: categoryQuestion
      },
    };
  }

  @Get('/404')
  @Render('pages/404')
  render404(@Req() req: Request) {
    return { title: '404', noLayout: true, user: req.session?.user };
  }
}
