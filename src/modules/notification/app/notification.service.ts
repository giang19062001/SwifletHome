import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { NotificationAppRepository } from './notification.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { IListApp } from 'src/interfaces/app.interface';
import { INotification, INotificationTopic, NotificationStatusEnum } from '../notification.interface';
import { UserAppRepository } from 'src/modules/user/app/user.repository';
import { CreateNotificationDto, CreateNotificationOfUserDto, DeleteNotificationByStatusDto } from './notification.dto';

@Injectable()
export class NotificationAppService {
  private readonly SERVICE_NAME = 'NotificationAppService';

  constructor(
    private readonly notificationAppRepository: NotificationAppRepository,
    private readonly userAppRepository: UserAppRepository,
    private readonly logger: LoggingService,
  ) {}
  async getAllTopic(dto: PagingDto): Promise<IList<INotificationTopic>> {
    const logbase = `${this.SERVICE_NAME}/getAllTopic`;

    const total = await this.notificationAppRepository.getTotalTopic();
    const list = await this.notificationAppRepository.getAllTopic(dto);
    return { total, list };
  }
  //* lấy các thông báo có userCode là user hiện tại OR có userCodesMulticast chứa userCode của user hiện tại OR thông báo là thông báo chung cho toàn user
  async getAll(dto: PagingDto, userCode: string): Promise<IListApp<INotification>> {
    const logbase = `${this.SERVICE_NAME}/getAll:`;
    // kiem tra user có bị xóa ko
    const checkUserHas = await this.userAppRepository.findByCode(userCode);
    if (checkUserHas) {
      const total = await this.notificationAppRepository.getTotal(userCode);
      const list = await this.notificationAppRepository.getAll(dto, userCode);
      this.logger.log(logbase, `total(${total})`);

      return { total, list };
    } else {
      return { total: 0, list: [] };
    }
  }
  async getCntNotifyNotReadByUser(userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/getCntNotifyNotReadByUser`;
    // kiem tra user có bị xóa ko
    const checkUserHas = await this.userAppRepository.findByCode(userCode);
    if (checkUserHas) {
      const result = await this.notificationAppRepository.getCntNotifyNotReadByUser(userCode);
      return result;
    } else {
      return 0;
    }
  }
  async getDetail(notificationId: string, userCode: string): Promise<INotification | null> {
    const logbase = `${this.SERVICE_NAME}/getDetail`;
    const result = await this.notificationAppRepository.getDetail(notificationId, userCode);
    return result;
  }
  async maskAsRead(notificationId: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/maskAsRead`;
    this.logger.log(logbase, `Đánh dấu thông báo là đã đọc ${notificationId}`);
    const result = await this.notificationAppRepository.maskAsRead(notificationId, userCode);
    return result;
  }
  async createNotification(dto: CreateNotificationDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/createNotification`;
    try {
      let result = 0;
      // insert thông báo chung
      result = await this.notificationAppRepository.insertNotification(dto);
      if (result) {
        // INSERT DỮ LIỆU TOÀN USER
        if (dto.topicCode) {
          // lấy danh sách toàn bộ user
          const userList = await this.userAppRepository.getAllUserCode();
          this.logger.log(logbase, `Số lượng user sẽ được thêm thông báo ${userList.length}`);

          // phân tán thông báo cho các user
          const insertPromises = userList.map((usr) => {
            const dtoUser: CreateNotificationOfUserDto = {
              notificationId: dto.notificationId,
              userCode: usr.userCode,
              notificationStatus: NotificationStatusEnum.SENT,
            };

            return this.notificationAppRepository.insertNotificationOfUser(dtoUser);
          });

          await Promise.all(insertPromises);
        } else if (dto.userCodesMuticast.length) {
          // INSERT DỮ LIỆU 1 VÀI USER
          this.logger.log(logbase, `Số lượng user sẽ được thêm thông báo ${dto.userCodesMuticast.length}`);

          // phân tán thông báo cho các user
          const insertPromises = dto.userCodesMuticast.map((userCode) => {
            const dtoUser: CreateNotificationOfUserDto = {
              notificationId: dto.notificationId,
              userCode: userCode,
              notificationStatus: NotificationStatusEnum.SENT,
            };

            return this.notificationAppRepository.insertNotificationOfUser(dtoUser);
          });
          await Promise.all(insertPromises);
        } else if (dto.userCode) {
          // INSERT DỮ LIỆU CHỈ 1  USER
          const dtoUser: CreateNotificationOfUserDto = {
            notificationId: dto.notificationId,
            userCode: dto.userCode,
            notificationStatus: NotificationStatusEnum.SENT,
          };

          return this.notificationAppRepository.insertNotificationOfUser(dtoUser);
        }
      }
      return result;
    } catch (error) {
      this.logger.error(logbase, `Lỗi : ${JSON.stringify(error)}`);
      return 0;
    }
  }

  async deteteNotificationByStatus(dto: DeleteNotificationByStatusDto, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/deteteNotificationByStatus`;
    this.logger.log(logbase, `Xóa thông báo của người dùng ${userCode} theo status ${dto.notificationStatus}`);
    const result = await this.notificationAppRepository.deteteNotificationByStatus(dto.notificationStatus, userCode);
    return result;
  }
  
  async deteteNotification(notificationId: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/deteteNotification`;
    this.logger.log(logbase, `Xóa thông báo ${notificationId}`);
    const result = await this.notificationAppRepository.deteteNotification(notificationId, userCode);
    return result;
  }
}
