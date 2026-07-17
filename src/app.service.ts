import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AnswerAdminService } from './modules/answer/admin/answer.service';
import { BlogAdminService } from './modules/blog/admin/blog.service';
import { CategoryAdminService } from './modules/category/admin/category.service';
import { ObjectAdminService } from './modules/object/admin/object.service';
import { OptionService } from './modules/options/option.service';
import { ProvinceService } from './modules/province/app/province.service';
import { QrAdminService } from './modules/qr/admin/qr.service';
import { SaleHomeAdminService } from './modules/saleHome/admin/saleHome.service';
import { ScreenAdminService } from './modules/screen/admin/screen.service';
import { TeamAdminService } from './modules/team/admin/team.service';
import { TodoAdminService } from './modules/todo/admin/todo.service';
import { UserAdminService } from './modules/user/admin/user.service';

@Injectable()
export class AppService {
  constructor(
    private readonly answerAdminService: AnswerAdminService,
    private readonly catetegoryAdminService: CategoryAdminService,
    private readonly saleHomeAdminService: SaleHomeAdminService,
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
  async renderHomeCreate(): Promise<any> {
    const options = await this.saleHomeAdminService.getInitFormOptions();
    const provinces = await this.provinceService.getAll();
    const usersResult = await this.userAdminService.getAllUser({ type: 'APP' as any, limit: 1000, page: 1, userName: '', userPhone: '' });
    return {
      ...options,
      uniqueId: uuidv4(),
      provinces,
      users: usersResult.list,
    };
  }

  async renderHomeUpdate(homeCode: string): Promise<any> {
    const homeData = await this.saleHomeAdminService.getDetailSaleHome(homeCode);
    const options = await this.saleHomeAdminService.getInitFormOptions();
    const provinces = await this.provinceService.getAll();
    const usersResult = await this.userAdminService.getAllUser({ type: 'APP' as any, limit: 1000, page: 1, userName: '', userPhone: '' });
    return {
      homeData,
      ...options,
      provinces,
      users: usersResult.list,
    };
  }

  async renderHomeSaleDetail(homeCode: string): Promise<any> {
    const homeData = await this.saleHomeAdminService.getDetailSaleHome(homeCode);
    const options = await this.saleHomeAdminService.getInitFormOptions();
    const provinces = await this.provinceService.getAll();
    const usersResult = await this.userAdminService.getAllUser({ type: 'APP' as any, limit: 1000, page: 1, userName: '', userPhone: '' });
    return {
      homeData,
      ...options,
      provinces,
      users: usersResult.list,
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
    const userTypes = await this.userAdminService.getAllUserType();
    return {
      provinces: provinces,
      userTypes: userTypes,
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
    const teamFileTypes = await this.teamAdminService.getTeamFileTypes();
    const teamServiceTypes = await this.teamAdminService.getTeamServiceTypes();

    return {
      provinces: provinces,
      userTypes: userTypes,
      teamFileTypes: teamFileTypes,
      teamServiceTypes: teamServiceTypes,
    };
  }
  async renderTeamUpdate(teamCode: string): Promise<any> {
    const teamData = await this.teamAdminService.getDetail(teamCode);
    const provinces = await this.provinceService.getAll();
    const userTypes = await this.userAdminService.getTypesForTeam();
    const teamFileTypes = await this.teamAdminService.getTeamFileTypes();
    const teamServiceTypes = await this.teamAdminService.getTeamServiceTypes();

    return {
      teamData: teamData,
      provinces: provinces,
      userTypes: userTypes,
      teamFileTypes: teamFileTypes,
      teamServiceTypes: teamServiceTypes,
    };
  }
  async renderTeamDetail(teamCode: string): Promise<any> {
    const teamData = await this.teamAdminService.getDetail(teamCode);
    const provinces = await this.provinceService.getAll();
    const userTypes = await this.userAdminService.getTypesForTeam();
    const teamFileTypes = await this.teamAdminService.getTeamFileTypes();
    const teamServiceTypes = await this.teamAdminService.getTeamServiceTypes();

    return {
      teamData: teamData,
      provinces: provinces,
      userTypes: userTypes,
      teamFileTypes: teamFileTypes,
      teamServiceTypes: teamServiceTypes,
    };
  }

  async renderBlockchain(): Promise<any> {
    const transactions = await this.qrAdminService.getBlockchainTransactions();
    return {
      transactions: transactions,
    };
  }
}
