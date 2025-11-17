import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { AppService } from './app.service';
import { Controller, Get, NotFoundException, Render, Req, Res, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { PageAuthAdminGuard } from './modules/auth/admin/auth.page.guard';

@ApiExcludeController() // hide from swagger
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/login')
  renderLogin() {
    return { title: 'Đăng nhập', isLayout: false };
  }

  // dashboard
  @Get('/dashboard/main')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/main')
  renderIndex(@Req() req: Request) {
    return {
      title: 'Trang chủ',
      isLayout: true,
      user: req.session.user,
    };
  }

  // config
  @Get('/dashboard/screen/list')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/screen')
  renderScreen(@Req() req: Request) {
    return {
      title: 'Danh sách cấu hình màn hình',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/screen/update')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/screen-update')
  async renderScreenUpdate(@Req() req: Request) {
    const screenKeyword = req.query['screen-keyword'] as string;
    const values = await this.appService.renderScreenUpdate(screenKeyword);
    if (values?.screenData) {
      return {
        title: 'Chỉnh sửa màn hình',
        isLayout: true,
        user: req.session.user,
        values: values,
      };
    }else{
       throw new NotFoundException()
    }
  }

  // question
  @Get('/dashboard/question/list')
  @UseGuards(PageAuthAdminGuard)
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
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/answer')
  renderAnswer(@Req() req: Request) {
    return {
      title: 'Danh sách trả lời',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/answer/create')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/answer-create')
  async renderAnswerCreate(@Req() req: Request) {
    const values = await this.appService.renderAnswerCreate();
    return {
      title: 'Thêm câu trả lời',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  @Get('/dashboard/answer/update/:id')
  @UseGuards(PageAuthAdminGuard)
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
  // category
  @Get('/dashboard/category/list')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/category')
  renderCategory(@Req() req: Request) {
    return {
      title: 'Danh sách thể loại',
      isLayout: true,
      user: req.session.user,
    };
  }

  // object
  @Get('/dashboard/object/list')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/object')
  renderObject(@Req() req: Request) {
    return {
      title: 'Danh sách thể loại',
      isLayout: true,
      user: req.session.user,
    };
  }
  //user
  @Get('/dashboard/user/list')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/user')
  renderUser(@Req() req: Request) {
    return {
      title: 'Danh sách khách hàng',
      isLayout: true,
      user: req.session.user,
    };
  }
  //blog
  @Get('/dashboard/blog/list')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/blog')
  renderBlog(@Req() req: Request) {
    return {
      title: 'Danh sách bài viết',
      isLayout: true,
      user: req.session.user,
    };
  }

  @Get('/dashboard/blog/create')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/blog-create')
  async renderBlogCreate(@Req() req: Request) {
    const values = await this.appService.renderBlogCreate();
    return {
      title: 'Thêm bài viết',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  @Get('/dashboard/blog/update/:id')
  @UseGuards(PageAuthAdminGuard)
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
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/home')
  renderHome(@Req() req: Request) {
    return {
      title: 'Danh sách nhà yến',
      isLayout: true,
      user: req.session.user,
    };
  }

  @Get('/dashboard/home/create')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/home-create')
  renderHomeCreate(@Req() req: Request) {
    return { title: 'Thêm nhà yến', isLayout: true, user: req.session.user };
  }

  @Get('/dashboard/home/update/:id')
  @UseGuards(PageAuthAdminGuard)
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
  @UseGuards(PageAuthAdminGuard)
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
  @UseGuards(PageAuthAdminGuard)
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
