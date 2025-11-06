import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { IAnswer } from './modules/answer/answer.interface';
import { CategoryService } from './modules/category/category.service';
import { HomeAdminService } from './modules/home/admin/home.service';
import { BlogAdminService } from './modules/blog/admin/blog.service';

@Injectable()
export class AppService {
  constructor(
    private readonly answerAdminService: AnswerAdminService,
    private readonly catetegoryService: CategoryService,
    private readonly homeAdminService: HomeAdminService,
    private readonly blogAdminService: BlogAdminService,
  ) {}
  // answer
  async getDetailAnswer(answerCode: string): Promise<IAnswer | null> {
    const result = await this.answerAdminService.getDetail(answerCode);
    return result;
  }
  async renderCreateAnswer(): Promise<any> {
    const { list } = await this.catetegoryService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      answerContent: '',
      answerObject: '',
      answerCategory: '',
      categories: list,
    };
  }
  async renderAnswerUpdate(answerCode: string): Promise<any> {
    const answer = await this.answerAdminService.getDetail(answerCode);
    const { list } = await this.catetegoryService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      isFree: answer?.isFree,
      answerContent: answer?.answerContent,
      answerObject: answer?.answerObject,
      answerCategory: answer?.answerCategory,
      categories: list,
    };
  }
  //blog
  async renderCreateBlog(): Promise<any> {
    const { list } = await this.catetegoryService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      blogContent: '',
      blogObject: '',
      blogCategory: '',
      categories: list,
    };
  }
  async renderBlogUpdate(blogCode: string): Promise<any> {
    const blog = await this.blogAdminService.getDetail(blogCode);
    const { list } = await this.catetegoryService.getAll({
      limit: 0,
      page: 0,
    });
    return {
      isFree: blog?.isFree,
      blogContent: blog?.blogContent,
      blogObject: blog?.blogObject,
      blogCategory: blog?.blogCategory,
      categories: list,
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
