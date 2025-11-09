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
    return { title: 'Đăng nhập', isLayout: false };
  }

  
  // dashboard
  @Get('/dashboard/main')
  @UseGuards(PageAuthGuard)
  @Render('pages/main')
  renderIndex(@Req() req: Request) {
    return {
      title: 'Trang chủ',
      isLayout: true,
      user: req.session.user,
    };
  }
  // question
  @Get('/dashboard/category/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/category-question')
  renderCateQuestion(@Req() req: Request) {
    return {
      title: 'Danh sách thể loại',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/question/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/question')
  renderQuestion(@Req() req: Request) {
    return {
      title: 'Danh sách câu hỏi',
      isLayout: true,
      user: req.session.user,
    };
  }

  // answer
  @Get('/dashboard/answer/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer')
  renderAnswer(@Req() req: Request) {
    return {
      title: 'Danh sách trả lời',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/answer/create')
  @UseGuards(PageAuthGuard)
  @Render('pages/answer-create')
  async renderCreateAnswer(@Req() req: Request) {
    const values = await this.appService.renderCreateAnswer();
    return {
      title: 'Thêm câu trả lời',
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
      title: 'Chỉnh sửa câu trả lời',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  //blog
  @Get('/dashboard/blog/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/blog')
  renderBlog(@Req() req: Request) {
    return {
      title: 'Danh sách bài viết',
      isLayout: true,
      user: req.session.user,
    };
  }

  @Get('/dashboard/blog/create')
  @UseGuards(PageAuthGuard)
  @Render('pages/blog-create')
  async renderCreateBlog(@Req() req: Request) {
    const values = await this.appService.renderCreateBlog();
    return {
      title: 'Thêm bài viết',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  @Get('/dashboard/blog/update/:id')
  @UseGuards(PageAuthGuard)
  @Render('pages/blog-update')
  async renderBlogUpdate(@Req() req: Request) {
    const values = await this.appService.renderBlogUpdate(req.params.id);
    return {
      title: 'Chỉnh sửa bài viết',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  //home
  @Get('/dashboard/home/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/home')
  renderHome(@Req() req: Request) {
    return {
      title: 'Danh sách nhà yến',
      isLayout: true,
      user: req.session.user,
    };
  }

  @Get('/dashboard/home/create')
  @UseGuards(PageAuthGuard)
  @Render('pages/home-create')
  renderHomeCreate(@Req() req: Request) {
    return { title: 'Thêm nhà yến', isLayout: true, user: req.session.user };
  }

  @Get('/dashboard/home/update/:id')
  @UseGuards(PageAuthGuard)
  @Render('pages/home-update')
  async renderHomeUpdate(@Req() req: Request) {
    const values = await this.appService.renderHomeUpdate(req.params.id);
    return {
      title: 'Chỉnh sửa nhà yến',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  @Get('/dashboard/home-submit/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/home-submit')
  renderHomeSubmit(@Req() req: Request) {
    return {
      title: 'Danh sách đăng ký tham quan',
      isLayout: true,
      user: req.session.user,
    };
  }

  // doctor
  @Get('/dashboard/doctor/list')
  @UseGuards(PageAuthGuard)
  @Render('pages/doctor')
  renderDoctor(@Req() req: Request) {
    return {
      title: 'Danh sách khám bệnh nhà yến',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/404')
  @Render('pages/404')
  render404(@Req() req: Request) {
    return { title: '404', isLayout: false, user: req.session?.user };
  }
}
