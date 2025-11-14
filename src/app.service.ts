import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { IAnswer } from './modules/answer/answer.interface';
import { HomeAdminService } from './modules/home/admin/home.service';
import { BlogAdminService } from './modules/blog/admin/blog.service';
import { CategoryAdminService } from './modules/category/admin/category.service';
import { ObjectAdminService } from './modules/object/admin/object.service';

@Injectable()
export class AppService {
  constructor(
    private readonly answerAdminService: AnswerAdminService,
    private readonly catetegoryAdminService: CategoryAdminService,
    private readonly homeAdminService: HomeAdminService,
    private readonly blogAdminService: BlogAdminService,
    private readonly objectAdminService: ObjectAdminService,
  ) {}
  // answer
  async getDetailAnswer(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerAdminService.getDetail(answerCode);
    return result;
  }
  async renderCreateAnswer(): Promise<any> {
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
  async renderCreateBlog(): Promise<any> {
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
}
