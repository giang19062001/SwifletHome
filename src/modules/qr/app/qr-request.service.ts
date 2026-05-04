import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { getFileLocation } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { TodoHarvestAppService } from 'src/modules/todo/app/todo-harvest.service';
import { TodoMedicineAppService } from 'src/modules/todo/app/todo-medicine.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TokenUserAppResDto } from '../../auth/app/auth.dto';
import { RequestStatusEnum } from '../qr.interface';
import { QrRequestAppRepository } from './qr-request.repository';
import { RequestQrCodeDto, UploadRequestVideoDto } from './qr.dto';
import { GetApprovedRequestQrCodeResDto, GetInfoToRequestQrcodeResDto, GetRequestQrCodeListResDto, QrRequestFileStrResDto, TaskHarvestQrResDto } from './qr.response';

@Injectable()
export class QrRequestAppService {
  private readonly SERVICE_NAME = 'QrRequestAppService';
  constructor(
    private readonly todoHarvestAppService: TodoHarvestAppService,
    private readonly todoMedicineAppService: TodoMedicineAppService,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly qrRequestAppRepository: QrRequestAppRepository,
    private readonly logger: LoggingService,
  ) {}
  async getRequestQrCocdeList(user: TokenUserAppResDto, dto: PagingDto): Promise<{ total: number; list: GetRequestQrCodeListResDto[] }> {
    const total = await this.qrRequestAppRepository.getRequestQrCocdeTotal(user.userCode);
    const rows = await this.qrRequestAppRepository.getRequestQrCocdeList(user.userCode, dto);
    const list = rows.map((item: any) => {
      let totalCellCollected = 0;

      // taskHarvestList TÍNH TỔNG Ô ĐÃ THU
      const taskHarvestList = typeof item.taskHarvestList === 'string' ? JSON.parse(item.taskHarvestList) : item.taskHarvestList;
      if (!Array.isArray(taskHarvestList)) {
        totalCellCollected = 0;
      }

      for (const harvest of taskHarvestList) {
        const harvestData = harvest?.harvestData;

        if (!Array.isArray(harvestData)) continue;

        for (const floor of harvestData) {
          const floorData = floor?.floorData;

          if (!Array.isArray(floorData)) continue;

          for (const cell of floorData) {
            totalCellCollected += Number(cell?.cellCollected || 0);
          }
        }
      }

      // loại bỏ 2 filed ko cần thiết
      const { taskHarvestList: _remove1, taskMedicineList: _remove2, ...rest } = item;

      return {
        ...rest,
        totalCellCollected,
      };
    });
    return { total: total, list: list };
  }

  async getApprovedRequestQrCocde(requestCode: string, user: TokenUserAppResDto): Promise<GetApprovedRequestQrCodeResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getApprovedRequestQrCocde:`;
    const result = await this.qrRequestAppRepository.getApprovedRequestQrCocde(requestCode, user.userCode);
    return result;
  }
  async getInfoToRequestQrcode(userHomeCode: string, user: TokenUserAppResDto, harvestPhase: number): Promise<(GetInfoToRequestQrcodeResDto & { seqHarvestPhase?: number }) | null> {
    const logbase = `${this.SERVICE_NAME}/getInfoToRequestQrcode:`;
    // lấy thông tin nhà
    const homeInfo = await this.userHomeAppService.getDetail(userHomeCode);
    if (!homeInfo) {
      this.logger.error(logbase, `Nhà yến ko có dữ liệu userHomeCode(${userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }
    if (homeInfo.userCode !== user.userCode) {
      this.logger.error(logbase, `Nhà yến ko không thuộc về user hiện tại userHomeCode(${userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    // lấy thông tin lăn thuốc nhà yến này
    const taskMedicineList = await this.todoMedicineAppService.getTaskMedicineCompleteAndNotUseList(userHomeCode);

    // lấy thông tin thu hoạc nhà yến này
    //? harvestPhase = 0 --> lấy tất cả các đợt để làm SelectBox cho Form yêu cầu Qr
    //? harvestPhase > 0 --> Chọn đợt và insert cho Qr table
    let taskHarvestCompleteList = await this.todoHarvestAppService.getTaskHarvestCompleteAndNotUseList(userHomeCode, harvestPhase);
    const taskHarvestList: TaskHarvestQrResDto[] = await Promise.all(
      taskHarvestCompleteList.map(async (ele) => ({
        harvestTaskAlarmCode: ele.harvestTaskAlarmCode,
        harvestPhase: ele.harvestPhase,
        harvestYear: ele.harvestYear,
        harvestData: await this.todoHarvestAppService.arrangeHarvestRows(ele.seq, homeInfo.userHomeFloor),
      })),
    );

    return {
      userName: user.userName,
      userHomeCode: userHomeCode,
      userHomeName: homeInfo.userHomeName,
      userHomeLength: homeInfo.userHomeLength,
      userHomeWidth: homeInfo.userHomeWidth,
      userHomeFloor: homeInfo.userHomeFloor,
      userHomeAddress: homeInfo.userHomeAddress,
      temperature: 0,
      humidity: 0,
      taskMedicineList: taskMedicineList,
      taskHarvestList: taskHarvestList,
      seqHarvestPhase: taskHarvestCompleteList.length > 0 ? (taskHarvestCompleteList[0] as any).seqHarvestPhase : undefined,
    } as GetInfoToRequestQrcodeResDto & { seqHarvestPhase?: number };
  }

  async validateHarvestBeforeRequestQr(userCode: string) {
    const logbase = `${this.SERVICE_NAME}/validateHarvestBeforeRequestQr:`;

    // get all homes of user
    const homes = await this.userHomeAppService.getAll({ page: 0, limit: 0, keyword: '' } as any, userCode);

    if (!homes.list || homes.list.length === 0) {
      return { total: 0, list: [] };
    }

    const list = await Promise.all(
      homes.list.map(async (home) => {
        const unusedHarvests = await this.todoHarvestAppService.getTaskHarvestCompleteAndNotUseList(home.userHomeCode, 0);
        return {
          userHomeCode: home.userHomeCode,
          userHomeName: home.userHomeName,
          isHarvestAvaliable: unusedHarvests.length > 0 ? true : false,
          harvestAvaliableList: unusedHarvests,
        };
      }),
    );

    return {
      total: homes.total,
      list: list,
    };
  }
  async requestQrCode(user: TokenUserAppResDto, dto: RequestQrCodeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestQrCode:`;

    try {
      let result = 1;

      // kiểm tra đợt thu hoạch của nhà yến này đã yêu cầu qrcode chưa
      const isUsed = await this.qrRequestAppRepository.checkUsedThisHarvest(dto.userHomeCode, user.userCode, dto.harvestPhase);
      if (isUsed) {
        this.logger.error(logbase, `${Msg.ThisHarvestRequestQrcodeAlready} - nhà yến (${dto.userHomeCode}) - đợt  (${dto.harvestPhase}) `);
        result = -2;
        return result;
      }

      // lấy thông tin lăn thuốc, thu hoạch,.. từ DB để insert
      const dataInsertDto = await this.getInfoToRequestQrcode(dto.userHomeCode, user, dto.harvestPhase);

      if (!dataInsertDto || !dataInsertDto.seqHarvestPhase) {
        this.logger.error(logbase, `Không thê lấy thông tin yêu cầu mã Qr từ cơ sở dữ liệu của người dùng (${user.userCode}) và nhà yến (${dto.userHomeCode})`);
        result = 0;
        return result;
      }

      if (!dataInsertDto.taskHarvestList.length) {
        this.logger.error(logbase, `${Msg.RequestNotAllowHarvestEmpty} của người dùng (${user.userCode}) và nhà yến (${dto.userHomeCode})`);
        result = -3;
        return result;
      }

      // tìm tất cả file đã upload cùng uniqueId
      const filesUploaded = await this.qrRequestAppRepository.findFilesByUniqueId(dto.uniqueId);
      if (filesUploaded.length) {
        // dánh đấu các lăn thuốc là đã dùng
        if (dataInsertDto.taskMedicineList.length) {
          for (const med of dataInsertDto.taskMedicineList) {
            await this.todoMedicineAppService.useOrUnuseTaskMedicineForQr(user.userCode, dataInsertDto.userHomeCode, med.medicineTaskAlarmCode, YnEnum.Y);
          }
        }

        // insert dữ liệu yêu cầu QR
        const seq = await this.qrRequestAppRepository.insertRequestQrCode(user.userCode, {
          ...dataInsertDto,
          seqHarvestPhase: dataInsertDto.seqHarvestPhase,
          requestStatus: RequestStatusEnum.WAITING,
          uniqueId: dto.uniqueId,
        });

        // cập nhập qrRequestSeq của các file đã tìm cùng uniqueId
        for (const file of filesUploaded) {
          console.log(file);
          await this.qrRequestAppRepository.updateSeqFiles(seq, file.seq, dto.uniqueId, user.userCode);
        }
      } else {
        // không có file ảnh nào được upload của nhà yến này -> báo lỗi
        result = -1;
        this.logger.error(logbase, `${Msg.UuidNotFound} --> uniqueId: ${dto.uniqueId}`);
        return result;
      }

      if (result == 1) {
        this.logger.log(logbase, `Yêu câu tạo mã Qrcode cho người dùng(${user.userCode}) thành công`);
      }
      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }

  async cancelRequest(requestCode: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/cancelRequest:`;

    const requestInfo = await this.qrRequestAppRepository.getRequestQrCocde(requestCode);
    if (!requestInfo) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }

    // chỉ chế độ chờ mới hủy dược
    if (requestInfo.requestStatus !== RequestStatusEnum.WAITING) {
      throw new BadRequestException({
        message: Msg.RequestCannotCancelNotWaiting,
        data: 0,
      });
    }
    // cập nhập lại isUse = 'N' cho các lần lăn thuốc của requestQr này
    const taskMedicineList = requestInfo.taskMedicineList as any;
    if (taskMedicineList?.length) {
      for (const med of taskMedicineList) {
        await this.todoMedicineAppService.useOrUnuseTaskMedicineForQr(userCode, requestInfo.userHomeCode, med.medicineTaskAlarmCode, YnEnum.N);
      }
    }

    const result = await this.qrRequestAppRepository.cancelRequest(requestInfo.seq!!, requestCode, userCode);
    return result;
  }
  // TODO: FILE
  async uploadRequestFile(userCode: string, dto: UploadRequestVideoDto, requestQrcodeFiles: Express.Multer.File[]): Promise<QrRequestFileStrResDto[]> {
    const logbase = `${this.SERVICE_NAME}/uploadRequestFile:`;
    try {
      let res: QrRequestFileStrResDto[] = [];
      if (requestQrcodeFiles.length > 0) {
        for (const file of requestQrcodeFiles) {
          this.logger.log(logbase, `Đang Upload file.. ${JSON.stringify(file)}`);
          const filenamePath = `${getFileLocation(file.mimetype, file.fieldname)}/${file.filename}`;
          const insertId = await this.qrRequestAppRepository.uploadRequestFile(0, dto.uniqueId, userCode, filenamePath, file);
          if (insertId > 0) {
            res.push({
              seq: insertId,
              filename: filenamePath,
            });
          }
        }
      }
      this.logger.log(logbase, `Upload file thành công: ${JSON.stringify(res)}`);
      return res;
    } catch (error) {
      this.logger.error(logbase, `Upload file thất bại: ${JSON.stringify(error)}`);
      return [];
    }
  }

  async getFilesNotUse() {
    return await this.qrRequestAppRepository.getFilesNotUse();
  }

  async deleteFile(seq: number) {
    return await this.qrRequestAppRepository.deleteFile(seq);
  }
}
