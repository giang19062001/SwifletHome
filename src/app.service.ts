import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { IAnswer } from './modules/answer/answer.interface';
import { HomeSaleAdminService } from './modules/homeSale/admin/homeSale.service';
import { BlogAdminService } from './modules/blog/admin/blog.service';
import { CategoryAdminService } from './modules/category/admin/category.service';
import { ObjectAdminService } from './modules/object/admin/object.service';
import { ScreenAdminService } from './modules/screen/admin/screen.service';
import { ProvinceService } from './modules/province/province.service';
import { TodoAdminService } from './modules/todo/admin/todo.service';

@Injectable()
export class AppService {
  constructor(
    private readonly answerAdminService: AnswerAdminService,
    private readonly catetegoryAdminService: CategoryAdminService,
    private readonly homeAdminService: HomeSaleAdminService,
    private readonly blogAdminService: BlogAdminService,
    private readonly objectAdminService: ObjectAdminService,
    private readonly provinceService: ProvinceService,
    private readonly screenAdminService: ScreenAdminService,
    private readonly todoAdminService: TodoAdminService,
  ) {}

  async renderAnswerCreate(): Promise<any> {
    const { list: categories } = await this.catetegoryAdminService.getAll({
      limit: 0,
      page: 0,
    });
    const { list: objects } = await this.objectAdminService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      answerContent: '',
      answerObject: '',
      answerCategory: '',
      categories: categories,
      objects: objects,
    };
  }
  async renderAnswerUpdate(answerCode: string): Promise<any> {
    const answer = await this.answerAdminService.getDetail(answerCode);
    const { list: categories } = await this.catetegoryAdminService.getAll({
      limit: 0,
      page: 0,
    });
    const { list: objects } = await this.objectAdminService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      isFree: answer?.isFree,
      answerContent: answer?.answerContent,
      answerObject: answer?.answerObject,
      answerCategory: answer?.answerCategory,
      categories: categories,
      objects: objects,
    };
  }
  //blog
  async renderBlogCreate(): Promise<any> {
    const { list: categories } = await this.catetegoryAdminService.getAll({
      limit: 0,
      page: 0,
    });
    const { list: objects } = await this.objectAdminService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      blogContent: '',
      blogObject: '',
      blogCategory: '',
      categories: categories,
      objects: objects,
    };
  }
  async renderBlogUpdate(blogCode: string): Promise<any> {
    const blog = await this.blogAdminService.getDetail(blogCode);
    const { list: categories } = await this.catetegoryAdminService.getAll({
      limit: 0,
      page: 0,
    });
    const { list: objects } = await this.objectAdminService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      isFree: blog?.isFree,
      blogContent: blog?.blogContent,
      blogName: blog?.blogName,
      blogObject: blog?.blogObject,
      blogCategory: blog?.blogCategory,
      categories: categories,
      objects: objects,
    };
  }
  // home
  async renderHomeUpdate(answerCode: string): Promise<any> {
    const homeData = await this.homeAdminService.getDetail(answerCode);
    return {
      homeData: homeData,
    };
  }

  // config
  async renderScreenUpdate(screenKeyword: string): Promise<any> {
    const screenData = await this.screenAdminService.getDetail(screenKeyword);
    return {
      screenData: screenData,
    };
  }
  // user home
  async renderUserHomes(): Promise<any> {
    const provinces = await this.provinceService.getAll();
    return {
      provinces: provinces,
    };
  }
  // notification
  async renderNotification(): Promise<any> {
    const provinces = await this.provinceService.getAll();
    return {
      provinces: provinces,
    };
  }
  // TaskAlarm
  async renderTaskAlarm(): Promise<any> {
    const provinces = await this.provinceService.getAll();
    const { total, list } = await this.todoAdminService.getAllTasks({ limit: 0, page: 0 });

    return {
      provinces: provinces,
      tasks: list,
    };
  }
}
