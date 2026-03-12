import { QrAdminService } from './modules/qr/admin/qr.service';
import { Injectable } from '@nestjs/common';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { HomeSaleAdminService } from './modules/homeSale/admin/homeSale.service';
import { BlogAdminService } from './modules/blog/admin/blog.service';
import { CategoryAdminService } from './modules/category/admin/category.service';
import { ObjectAdminService } from './modules/object/admin/object.service';
import { ScreenAdminService } from './modules/screen/admin/screen.service';
import { ProvinceService } from './modules/province/province.service';
import { TodoAdminService } from './modules/todo/admin/todo.service';
import { TeamAdminService } from './modules/team/admin/team.service';
import { UserAdminService } from './modules/user/admin/user.service';
import { OptionService } from './modules/options/option.service';
import { OPTION_CONST } from './modules/options/option.interface';
import { AnswerResDto } from "./modules/answer/answer.response";

@Injectable()
export class AppService {
  constructor(
    private readonly answerAdminService: AnswerAdminService,
    private readonly catetegoryAdminService: CategoryAdminService,
    private readonly homeAdminService: HomeSaleAdminService,
    private readonly teamAdminService: TeamAdminService,
    private readonly blogAdminService: BlogAdminService,
    private readonly objectAdminService: ObjectAdminService,
    private readonly provinceService: ProvinceService,
    private readonly screenAdminService: ScreenAdminService,
    private readonly todoAdminService: TodoAdminService,
    private readonly qrAdminService: QrAdminService,
    private readonly userAdminService: UserAdminService,
    private readonly optionService: OptionService,
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
  async renderHomeUpdate(homeCode: string): Promise<any> {
    const homeData = await this.homeAdminService.getDetail(homeCode);
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
  async renderUserTeams(): Promise<any> {
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

  // qrcode
  async renderQrcodeUpdate(requestCode: string): Promise<any> {
    const qrData = await this.qrAdminService.getDetail(requestCode);
    return {
      qrData: qrData,
    };
  }

  // team
  async renderTeamCreate(): Promise<any> {
    const provinces = await this.provinceService.getAll();
    const userTypes = await this.userAdminService.getTypesForTeam();
    const technicalTypes = await this.optionService.getAll({
      mainOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.mainOption,
      subOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.subOption,
    });
    return {
      provinces: provinces,
      userTypes: userTypes,
      technicalTypes: technicalTypes,
    };
  }
  async renderTeamUpdate(teamCode: string): Promise<any> {
    const teamData = await this.teamAdminService.getDetail(teamCode);
    const provinces = await this.provinceService.getAll();
    const userTypes = await this.userAdminService.getTypesForTeam();
    const technicalTypes = await this.optionService.getAll({
      mainOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.mainOption,
      subOption: OPTION_CONST.USER_TEAM.TECHNICAL_TYPE.subOption,
    });
    return {
      teamData: teamData,
      provinces: provinces,
      userTypes: userTypes,
      technicalTypes: technicalTypes,
    };
  }
}
