import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiMutationResponse, IList } from 'src/interfaces/admin.interface';
import { TodoAdminRepository } from './todo.repository';
import { ITodoBoxTask, ITodoTask } from '../todo.interface';
import { SetTaskAlarmByAdminDto, UpdateBoxTaskArrayDto, UpdateBoxTaskDto } from './todo.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { SentTypeEnum } from 'src/modules/notification/admin/notification.dto';
import { FirebaseService } from 'src/common/firebase/firebase.service';
import { NotificationAdminRepository } from 'src/modules/notification/admin/notification.repository';
import { UserAdminRepository } from 'src/modules/user/admin/user.repository';
import { UserHomeAdminRepository } from 'src/modules/userHome/admin/userHome.repository';
import { MsgAdmin } from 'src/helpers/message.helper';
import { KEYWORDS } from 'src/helpers/const.helper';

@Injectable()
export class TodoAdminService {
  private readonly SERVICE_NAME = 'TodoAdminService';

  constructor(
    private readonly todoAdminRepository: TodoAdminRepository,
    private readonly logger: LoggingService,
    private readonly firebaseService: FirebaseService,
    private readonly notificationAdminRepository: NotificationAdminRepository,
    private readonly userAdminRepository: UserAdminRepository,
    private readonly userHomeAdminRepository: UserHomeAdminRepository,
  ) {}
  async getAllTasks(dto: PagingDto): Promise<IList<ITodoTask>> {
    const total = await this.todoAdminRepository.getTotalTasks();
    const list = await this.todoAdminRepository.getAllTasks(dto);
    return { total, list };
  }
  async getBoxTasks(): Promise<ITodoBoxTask[]> {
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
        const allHomes = await this.userHomeAdminRepository.getUserHomesByUser();
        if (allHomes.length) {
          for (const home of allHomes) {
            this.logger.log(logbase, `Tạo lịch nhắc cho user(${home.userCode}) với nhà yến(${home.userHomeCode})`);

            // insert lịch nhắc cho từng nhà yến cùa từng user
            await this.todoAdminRepository.insertTaskAlarm(home.userCode, home.userHomeCode, dto, createdId);
          }
        }
        // lấy danh sách topic dùng cho tất cả user
        const topicCommon = await this.notificationAdminRepository.getDetailTopic(KEYWORDS.NOTIFICATION_TOPIC.COMMON);
        // gửi thông báo chung
        await this.firebaseService.sendNotificationToTopic(topicCommon?.topicCode ?? '', dto.title, dto.body);
      } else if (dto.sendType == SentTypeEnum.USER) {
        const userDeviceTokens = await this.userAdminRepository.getDeviceTokensByUsers(dto.userCodesMuticast);

        if (userDeviceTokens.length) {
          // lấy danh sách nhà của tất cả user
          const allHomes = await this.userHomeAdminRepository.getUserHomesByUser(dto.userCodesMuticast);
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
        const userHomes = await this.userHomeAdminRepository.getUserHomesByProvinces(dto.provinceCodesMuticast);
        // lọc các userCode duy nhất để chống trùng lặp có trong mảng
        const userDeviceTokens = Array.from(new Map(userHomes.map((item) => [item.userCode, item])).values()).map((item) => ({
          userCode: item.userCode,
          deviceToken: item.deviceToken,
        }));

        // gửi thông báo
        if (userDeviceTokens.length) {
          // lấy danh sách nhà của tất cả user
          const allHomes = await this.userHomeAdminRepository.getUserHomesByUser(userDeviceTokens.map((usr) => usr.userCode));
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
