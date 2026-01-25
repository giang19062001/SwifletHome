import { QrAppRepository } from './qr.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';
import { TodoAppRepository } from 'src/modules/todo/app/todo.repository';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { GetApprovedRequestQrCodeResDto, GetInfoToRequestQrcodeResDto, InsertRequestSellDto, RequestQrCodeDto, TaskHarvestQrResDto, UploadRequestVideoDto, UploadRequestVideoResDto } from '../qr.dto';
import { Msg } from 'src/helpers/message.helper';
import { TodoAppService } from 'src/modules/todo/app/todo.service';
import { getFileLocation } from 'src/config/multer.config';
import { RequestStatusEnum } from '../qr.interface';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';

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
  async getApprovedRequestQrCocde(requestCode: string, user: ITokenUserApp): Promise<GetApprovedRequestQrCodeResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getApprovedRequestQrCocde:`;
    const result = await this.qrAppRepository.getApprovedRequestQrCocde(requestCode, user.userCode);
    return result;
  }
  async getInfoToRequestQrcode(userHomeCode: string, user: ITokenUserApp, harvestPhase: number): Promise<GetInfoToRequestQrcodeResDto | null> {
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
      userHomeLength: homeInfo.userHomeLength,
      userHomeWidth: homeInfo.userHomeWidth,
      userHomeFloor: homeInfo.userHomeFloor,
      userHomeAddress: homeInfo.userHomeAddress,
      temperature: 0,
      humidity: 0,
      taskMedicineList: taskMedicineList,
      taskHarvestList: taskHarvestList,
    } as GetInfoToRequestQrcodeResDto;
  }
  async requestQrCode(user: ITokenUserApp, dto: RequestQrCodeDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/requestQrCode:`;

    try {
      let result = 1;

      // kiểm tra nhà yến với đợt thu hoạch này đã yêu cầu chưa
      const isDuplicate = await this.qrAppRepository.checkDuplicateReuqestQrCode(dto.userHomeCode, user.userCode, dto.harvestPhase);
      if (isDuplicate) {
        this.logger.error(logbase, `${Msg.RequestQrcodeAlreadyExsist} - nhà yến (${dto.userHomeCode}) - đợt  (${dto.harvestPhase}) `);
        result = -2;
        return result;
      }
      // lấy thông tin lăn thuốc, thu hoạch,.. từ DB để insert
      const dataInsertDto = await this.getInfoToRequestQrcode(dto.userHomeCode, user, dto.harvestPhase);
      console.log(dataInsertDto);
      if (!dataInsertDto) {
        this.logger.error(logbase, `Không thê lấy thông tin yêu cầu mã Qr từ cơ sở dữ liệu của người dùng (${user.userCode}) và nhà yến (${dto.userHomeCode})`);
        result = 0;
        return result;
      }
      // tìm file đã upload cùng uniqueId
      const filesUploaded = await this.qrAppRepository.findFilesByUniqueId(dto.uniqueId);
      // có file được upload cùng uuid -> insert
      if (filesUploaded) {
        // thêm nhà yến của user
        this.logger.log(logbase, `Video quy trình chế biến đóng gói của Yêu câu tạo mã Qrcode này là: ${filesUploaded.filename} `);

        const seq = await this.qrAppRepository.insertRequestQrCode(user.userCode, {
          ...dataInsertDto,
          harvestPhase: dto.harvestPhase,
          requestStatus: RequestStatusEnum.WAITING,
          uniqueId: dto.uniqueId,
        });
        // cập nhập userHomeSEQ của file đã tìm cùng uniqueId với nhà yến vừa created
        await this.qrAppRepository.updateSeqFiles(seq, filesUploaded.seq, dto.uniqueId, user.userCode);
      } else {
        // không có file ảnh nào được upload của nhà yến này -> báo lỗi
        result = -1;
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

  // TODO: FILE
  async uploadRequestVideo(userCode: string, dto: UploadRequestVideoDto, requestQrcodeVideoFile: Express.Multer.File): Promise<UploadRequestVideoResDto> {
    const logbase = `${this.SERVICE_NAME}/uploadRequestVideo:`;
    try {
      let res: UploadRequestVideoResDto = { seq: 0, filename: '' };
      if (requestQrcodeVideoFile) {
        this.logger.log(logbase, JSON.stringify(requestQrcodeVideoFile));

        const filenamePath = `${getFileLocation(requestQrcodeVideoFile.mimetype, requestQrcodeVideoFile.fieldname)}/${requestQrcodeVideoFile.filename}`;
        const insertId = await this.qrAppRepository.uploadRequestVideo(0, dto.uniqueId, userCode, filenamePath, requestQrcodeVideoFile);
        if (insertId > 0) {
          res.seq = insertId;
          res.filename = filenamePath;
        }
      }
      return res;
    } catch (error) {
      this.logger.error(logbase, JSON.stringify(error));
      return { seq: 0, filename: '' };
    }
  }
  // TODO: SELL
  async requestSell(user: ITokenUserApp, dto: InsertRequestSellDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/insertRequestSell:`;

    try {
      // kiểm tra thông tin qr
      const getRequestQrInfo = await this.qrAppRepository.getApprovedRequestQrCocde(dto.requestCode, user.userCode);
      if (!getRequestQrInfo) {
        this.logger.error(logbase, `${Msg.RequestQrcodeNotFound} ---- requestCode(${dto.requestCode})`);
        return -1;
      }

      // kiểm tra priceOptionCode
      const priceOptionCodes = await this.optionService.getAll({
        mainOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.mainOption,
        subOption: OPTION_CONST.REQUSET_SELL.PRICE_OPTION.subOption,
      });

      if (!priceOptionCodes.map((c) => c.code).includes(dto.priceOptionCode)) {
        this.logger.error(logbase, `${Msg.CodeInvalid} ---- priceOptionCode(${dto.priceOptionCode})`);
        return -2;
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
}
