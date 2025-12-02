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

  // config/screen
  @Get('/dashboard/config/screen')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/screen')
  renderScreen(@Req() req: Request) {
    return {
      title: 'Danh sách cấu hình màn hình',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/config/screen/update')
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
    } else {
      throw new NotFoundException();
    }
  }

  // config/info
  @Get('/dashboard/config/info')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/info')
  renderInfo(@Req() req: Request) {
    return {
      title: 'Danh sách thông tin chung',
      isLayout: true,
      user: req.session.user,
    };
  }
  // q-and-a/question
  @Get('/dashboard/q-and-a/question')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/question')
  renderQuestion(@Req() req: Request) {
    return {
      title: 'Danh sách câu hỏi',
      isLayout: true,
      user: req.session.user,
    };
  }

  // q-and-a/answer
  @Get('/dashboard/q-and-a/answer')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/answer')
  renderAnswer(@Req() req: Request) {
    return {
      title: 'Danh sách trả lời',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/q-and-a/answer/create')
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

  @Get('/dashboard/q-and-a/answer/update/:id')
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

  // catalog/package
  @Get('/dashboard/catalog/package')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/package')
  renderPackage(@Req() req: Request) {
    return {
      title: 'Danh sách gói trả phí',
      isLayout: true,
      user: req.session.user,
    };
  }
  // catalog/category
  @Get('/dashboard/catalog/category')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/category')
  renderCategory(@Req() req: Request) {
    return {
      title: 'Danh sách thể loại',
      isLayout: true,
      user: req.session.user,
    };
  }

  // catalog/object
  @Get('/dashboard/catalog/object')
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
  @Get('/dashboard/user/info')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/user')
  renderUser(@Req() req: Request) {
    return {
      title: 'Danh sách khách hàng',
      isLayout: true,
      user: req.session.user,
    };
  }
  @Get('/dashboard/user/homes')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/user-homes')
  renderUserHomes(@Req() req: Request) {
    return {
      title: 'Danh sách nhà yến khách hàng',
      isLayout: true,
      user: req.session.user,
    };
  }
  //blog
  @Get('/dashboard/blog')
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

  //home/sale
  @Get('/dashboard/home/sale')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/home-sale')
  renderHome(@Req() req: Request) {
    return {
      title: 'Danh sách nhà yến',
      isLayout: true,
      user: req.session.user,
    };
  }

  @Get('/dashboard/home/sale/create')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/home-sale-create')
  renderHomeCreate(@Req() req: Request) {
    return { title: 'Thêm nhà yến', isLayout: true, user: req.session.user };
  }

  @Get('/dashboard/home/sale/update/:id')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/home-sale-update')
  async renderHomeUpdate(@Req() req: Request) {
    const values = await this.appService.renderHomeUpdate(req.params.id);
    return {
      title: 'Chỉnh sửa nhà yến',
      isLayout: true,
      user: req.session.user,
      values: values,
    };
  }

  // home/sightseeing
  @Get('/dashboard/home/sightseeing')
  @UseGuards(PageAuthAdminGuard)
  @Render('pages/home-sale-sightseeing')
  renderHomeSightseeing(@Req() req: Request) {
    return {
      title: 'Danh sách đăng ký tham quan',
      isLayout: true,
      user: req.session.user,
    };
  }

  // doctor
  @Get('/dashboard/doctor')
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
