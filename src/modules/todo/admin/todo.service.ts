import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { LoggingService } from 'src/common/logger/logger.service';
import { PagingDto } from 'src/dto/admin.dto';
import { MsgAdmin } from 'src/helpers/message.helper';
import { ApiMutationResponse } from 'src/interfaces/admin.interface';
import { SentTypeEnum } from 'src/modules/notification/admin/notification.dto';
import { NotificationAdminService } from 'src/modules/notification/admin/notification.service';
import { NOTIFICATION_CONST } from 'src/modules/notification/notification.interface';
import { UserAdminService } from 'src/modules/user/admin/user.service';
import { UserHomeAdminService } from 'src/modules/userHome/admin/userHome.service';
import { TodoBoxTaskResDto, TodoTaskResDto } from "../todo.response";
import { SetTaskAlarmByAdminDto, UpdateBoxTaskArrayDto } from './todo.dto';
import { TodoAdminRepository } from './todo.repository';

@Injectable()
export class TodoAdminService {
  private readonly SERVICE_NAME = 'TodoAdminService';

  constructor(
    private readonly todoAdminRepository: TodoAdminRepository,
    private readonly logger: LoggingService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminService: NotificationAdminService,
    private readonly userAdminService: UserAdminService,
    private readonly userHomeAdminService: UserHomeAdminService,
  ) {}
  async getAllTasks(dto: PagingDto): Promise<{ total: number; list: TodoTaskResDto[] }> {
    const total = await this.todoAdminRepository.getTotalTasks();
    const list = await this.todoAdminRepository.getAllTasks(dto);
    return { total, list };
  }
  async getBoxTasks(): Promise<TodoBoxTaskResDto[]> {
    const result = await this.todoAdminRepository.getBoxTasks();
    return result;
  }

  async updateBoxTask(dtoParent: UpdateBoxTaskArrayDto, updatedId: string): Promise<number> {
    try {
      for (const dto of dtoParent.boxTasksArray) {
        await this.todoAdminRepository.updateBoxTask(dto, updatedId);
      }
      return 1;
    } catch (error) {
      return 0;
    }
  }
  async setTaskAlarmByAdmin(dto: SetTaskAlarmByAdminDto, createdId: string): Promise<ApiMutationResponse> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarmByAdmin:`;
    console.log('SetTaskAlarmByAdminDto ----------> ', dto);

    try {
      if (dto.sendType == SentTypeEnum.ALL) {
        // lấy danh sách nhà của tất cả user
        const allHomes = await this.userHomeAdminService.getUserHomesByUser();
        if (allHomes.length) {
          for (const home of allHomes) {
            this.logger.log(logbase, `Tạo lịch nhắc cho user(${home.userCode}) với nhà yến(${home.userHomeCode})`);

            // insert lịch nhắc cho từng nhà yến cùa từng user
            await this.todoAdminRepository.insertTaskAlarm(home.userCode, home.userHomeCode, dto, createdId);
          }
        }
        // lấy danh sách topic dùng cho tất cả user
        const topicCommon = await this.notificationAdminService.getDetailTopic(NOTIFICATION_CONST.TOPIC.COMMON);
        // gửi thông báo chung
        await this.firebaseService.sendNotificationToTopic(topicCommon?.topicCode ?? '', dto.title, dto.body);
      } else if (dto.sendType == SentTypeEnum.USER) {
        const userDeviceTokens = await this.userAdminService.getDeviceTokensByUsers(dto.userCodesMuticast);

        if (userDeviceTokens.length) {
          // lấy danh sách nhà của tất cả user
          const allHomes = await this.userHomeAdminService.getUserHomesByUser(dto.userCodesMuticast);
          if (allHomes.length) {
            for (const home of allHomes) {
              this.logger.log(logbase, `Tạo lịch nhắc cho user(${home.userCode}) với nhà yến(${home.userHomeCode})`);

              // insert lịch nhắc cho từng nhà yến cùa từng user
              await this.todoAdminRepository.insertTaskAlarm(home.userCode, home.userHomeCode, dto, createdId);
            }
          }
          // gửi thông báo cho 1 vài user cụ thể
          const result = await this.firebaseService.sendNotificationToMulticast(userDeviceTokens, dto.title, dto.body);
          if (result) {
            return { success: true, message: MsgAdmin.pushAlarmOk };
          } else {
            return { success: false, message: MsgAdmin.pushAlarmErr };
          }
        }
      } else if (dto.sendType == SentTypeEnum.PROVINCE) {
        const userHomes = await this.userHomeAdminService.getUserHomesByProvinces(dto.provinceCodesMuticast);
        // lọc các userCode duy nhất để chống trùng lặp có trong mảng
        const userDeviceTokens = Array.from(new Map(userHomes.map((item) => [item.userCode, item])).values()).map((item) => ({
          userCode: item.userCode,
          deviceToken: item.deviceToken,
        }));

        // gửi thông báo
        if (userDeviceTokens.length) {
          // lấy danh sách nhà của tất cả user
          const allHomes = await this.userHomeAdminService.getUserHomesByUser(userDeviceTokens.map((usr) => usr.userCode));
          if (allHomes.length) {
            for (const home of allHomes) {
              this.logger.log(logbase, `Tạo lịch nhắc cho user(${home.userCode}) với nhà yến(${home.userHomeCode})`);

              // insert lịch nhắc cho từng nhà yến cùa từng user
              await this.todoAdminRepository.insertTaskAlarm(home.userCode, home.userHomeCode, dto, createdId);
            }
          }
          // gửi thông báo cho 1 vài user cụ thể
          const result = await this.firebaseService.sendNotificationToMulticast(userDeviceTokens, dto.title, dto.body);
          if (result) {
            return { success: true, message: MsgAdmin.pushAlarmOk };
          } else {
            return { success: false, message: MsgAdmin.pushAlarmErr };
          }
        } else {
          return { success: false, message: MsgAdmin.pushProvinceEmpty };
        }
      }
      return { success: true, message: MsgAdmin.pushAlarmOk };
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return { success: false, message: MsgAdmin.pushAlarmErr };
    }
  }
}
