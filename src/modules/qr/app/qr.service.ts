import { GetTypeEnum, MarkTypeEnum } from './../qr.interface';
import { QrAppRepository } from './qr.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { TodoAppRepository } from 'src/modules/todo/app/todo.repository';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import {
  GetApprovedRequestQrCodeResDto,
  GetInfoToRequestQrcodeResDto,
  GetRequestQrCodeListResDto,
  GetRequestSellDetailResDto,
  GetRequestSellListResDto,
  TaskHarvestQrResDto,
} from './qr.response';
import { GetRequestSellListDto, InsertRequestSellDto, RequestQrCodeDto, UploadRequestVideoDto } from './qr.dto';
import { Msg } from 'src/helpers/message.helper';
import { TodoAppService } from 'src/modules/todo/app/todo.service';
import { getFileLocation } from 'src/config/multer.config';
import { RequestStatusEnum } from '../qr.interface';
import { OPTION_CONST, RequestSellPriceOptionEnum } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { YnEnum } from 'src/interfaces/admin.interface';
import moment from 'moment';
import { PagingDto } from 'src/dto/admin.dto';
import { QrRequestFileStrResDto } from "../qr.response";
import { TokenUserAppResDto } from "../../auth/app/auth.dto";

@Injectable()
export class QrAppService {
  private readonly SERVICE_NAME = 'QrAppService';
  constructor(
    private readonly todoAppService: TodoAppService,
    private readonly todoAppRepository: TodoAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly qrAppRepository: QrAppRepository,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}
  async getRequestQrCocdeList(user: TokenUserAppResDto, dto: PagingDto): Promise<{ total: number; list: GetRequestQrCodeListResDto[] }> {
    const total = await this.qrAppRepository.getRequestQrCocdeTotal(user.userCode);
    const rows = await this.qrAppRepository.getRequestQrCocdeList(user.userCode, dto);
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
    const result = await this.qrAppRepository.getApprovedRequestQrCocde(requestCode, user.userCode);
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
    const taskMedicineList = await this.todoAppRepository.getTaskMedicineCompleteList(userHomeCode);

    // lấy thông tin thu hoạc nhà yến này
    let taskHarvestCompleteList = await this.todoAppRepository.getTaskHarvestCompleteList(userHomeCode, harvestPhase); // harvestPhase = 0 --> LẤY TẤT CẢ ĐỢT
    const taskHarvestList: TaskHarvestQrResDto[] = await Promise.all(
      taskHarvestCompleteList.map(async (ele) => ({
        harvestTaskAlarmCode: ele.harvestTaskAlarmCode,
        harvestPhase: ele.harvestPhase,
        harvestYear: ele.harvestYear,
        harvestData: await this.todoAppService.arrangeHarvestRows(ele.seq, homeInfo.userHomeFloor),
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
  async requestQrCode(user: TokenUserAppResDto, dto: RequestQrCodeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestQrCode:`;

    try {
      let result = 1;

      // kiểm tra đợt thu hoạch của nhà yến này đã yêu cầu qrcode chưa
      const isUsed = await this.qrAppRepository.checkUsedThisHarvest(dto.userHomeCode, user.userCode, dto.harvestPhase);
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
      const filesUploaded = await this.qrAppRepository.findFilesByUniqueId(dto.uniqueId);
      if (filesUploaded.length) {
        // dánh đấu các lăn thuốc là đã dùng
        if (dataInsertDto.taskMedicineList.length) {
          for (const med of dataInsertDto.taskMedicineList) {
            await this.todoAppRepository.useOrUnuseTaskMedicineForQr(user.userCode, dataInsertDto.userHomeCode, med.medicineTaskAlarmCode, YnEnum.Y);
          }
        }

        // insert dữ liệu yêu cầu QR
        const seq = await this.qrAppRepository.insertRequestQrCode(user.userCode, {
          ...dataInsertDto,
          seqHarvestPhase: dataInsertDto.seqHarvestPhase, 
          requestStatus: RequestStatusEnum.WAITING,
          uniqueId: dto.uniqueId,
        });

        // cập nhập qrRequestSeq của các file đã tìm cùng uniqueId
        for (const file of filesUploaded) {
          console.log(file);
          await this.qrAppRepository.updateSeqFiles(seq, file.seq, dto.uniqueId, user.userCode);
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
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }

  async cancelRequest(requestCode: string, userCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/cancelRequest:`;

    const requestInfo = await this.qrAppRepository.getRequestQrCocde(requestCode);
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
    const result = await this.qrAppRepository.cancelRequest(requestInfo.taskMedicineList, requestInfo.seq!!, requestCode, requestInfo.userHomeCode, userCode);
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
          const insertId = await this.qrAppRepository.uploadRequestFile(0, dto.uniqueId, userCode, filenamePath, file);
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
  // TODO: SELL
  async getRequestSellList(dto: GetRequestSellListDto, userCode: string): Promise<{ total: number; list: GetRequestSellListResDto[] }> {
    const logbase = `${this.SERVICE_NAME}/getRequestSellList:`;
    const total = await this.qrAppRepository.getRequestSellTotal(dto, userCode);
    const rows = await this.qrAppRepository.getRequestSellList(dto, userCode);
    return { total: total, list: rows };
  }
  async getRequestSellDetail(requestCode: string, userCode: string): Promise<GetRequestSellDetailResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getRequestSellList:`;
    // đánh dầu đã xem
    await this.maskRequestSell(requestCode, userCode, MarkTypeEnum.VIEW);
    const result = await this.qrAppRepository.getRequestSellDetail(requestCode);
    return result;
  }
  async requestSell(user: TokenUserAppResDto, dto: InsertRequestSellDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/insertRequestSell:`;

    try {
      // kiểm tra thông tin qr
      const getRequestQrInfo = await this.qrAppRepository.getApprovedRequestQrCocde(dto.requestCode, user.userCode);
      if (!getRequestQrInfo) {
        this.logger.error(logbase, `${Msg.RequestQrcodeNotFound} ---- requestCode(${dto.requestCode})`);
        return -1;
      }

      if (getRequestQrInfo.isSold === YnEnum.Y) {
        this.logger.error(logbase, `${Msg.RequestInfoAlreadySold} ---- requestCode(${dto.requestCode})`);
        return -3;
      }

      // kiểm tra priceOptionCode
      const priceOptionCodes = await this.optionService.getAll({
        mainOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.mainOption,
        subOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.subOption,
      });

      const priceOption = priceOptionCodes.find((c) => c.code.includes(dto.priceOptionCode));
      if (!priceOption) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- priceOptionCode(${dto.priceOptionCode})`);
        return -2;
      }

      // trường hợp 'giá thương lượng' thì 'pricePerKg' cho là 0
      if (priceOption.keyOption == RequestSellPriceOptionEnum.NEGOTIATE) {
        dto.pricePerKg = 0;
      }

      // kiểm tra ingredientNestOptionCode
      const ingredientNestOptionCodes = await this.optionService.getAll({
        mainOption: OPTION_CONST.REQUSET_SELL.INGREDIENT_NEST.mainOption,
        subOption: OPTION_CONST.REQUSET_SELL.INGREDIENT_NEST.subOption,
      });

      if (!ingredientNestOptionCodes.map((c) => c.code).includes(dto.ingredientNestOptionCode)) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- ingredientNestOptionCode(${dto.ingredientNestOptionCode})`);
        return -2;
      }
      const result = await this.qrAppRepository.insertRequestSell(user.userCode, dto);

      return result;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return 0;
    }
  }
  // TODO: SELL-INTERACT
  async maskRequestSell(requestCode: string, userCode: string, markType: MarkTypeEnum): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/maskRequestSell:`;
    const result = await this.qrAppRepository.maskRequestSell(requestCode, userCode, markType);
    return result;
  }
}
