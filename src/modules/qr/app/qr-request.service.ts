import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { MailService } from 'src/common/mail/mail.service';
import { getFileLocation } from 'src/config/multer.config';
import { PagingDto } from 'src/dto/admin.dto';
import { Msg } from 'src/helpers/message.helper';
import { TodoHarvestAppService } from 'src/modules/todo/app/todo-harvest.service';
import { TodoMedicineAppService } from 'src/modules/todo/app/todo-medicine.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TokenUserAppResDto } from '../../auth/app/auth.dto';
import { RequestStatusEnum } from '../qr.interface';
import { QrRequestAppRepository } from './qr-request.repository';
import { RequestQrCodeDto, UploadRequestVideoDto } from './qr.dto';
import { GetApprovedRequestQrCodeResDto, GetInfoToRequestQrcodeResDto, GetRequestQrCodeDetailResDto, GetRequestQrCodeListResDto, QrRequestFileStrResDto, TaskHarvestQrResDto } from './qr.response';

@Injectable()
export class QrRequestAppService {
  private readonly SERVICE_NAME = 'QrRequestAppService';
  constructor(
    private readonly todoHarvestAppService: TodoHarvestAppService,
    private readonly todoMedicineAppService: TodoMedicineAppService,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly qrRequestAppRepository: QrRequestAppRepository,
    private readonly logger: LoggingService,
    private readonly mailService: MailService,
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
  async getRequestQrCodeDetail(requestCode: string, user: TokenUserAppResDto): Promise<GetRequestQrCodeDetailResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getRequestQrCodeDetail:`;
    const result = await this.qrRequestAppRepository.getRequestQrCodeDetail(requestCode, user.userCode);
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

    // BƯỚC QUAN TRỌNG: LUÔN LẤY TẤT CẢ CÁC ĐỢT THU HOẠCH (harvestPhase = 0) ĐỂ TÍNH TOÁN TIMELINE CHÍNH XÁC
    let allTaskHarvestCompleteList = await this.todoHarvestAppService.getTaskHarvestCompleteAndNotUseList(userHomeCode, 0);

    // Sắp xếp các đợt thu hoạch theo thứ tự thời gian tăng dần (ASC)
    allTaskHarvestCompleteList.sort((a, b) => moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf());
    // Sắp xếp lăn thuốc theo thứ tự thời gian tăng dần (ASC)
    taskMedicineList.sort((a, b) => moment(a.timestamp).valueOf() - moment(b.timestamp).valueOf());

    // Lấy toàn bộ data chi tiết tầng/ô một lần
    const seqs = allTaskHarvestCompleteList.map((ele) => ele.seq);
    const arrangedData = await this.todoHarvestAppService.arrangeMultipleHarvestRows(seqs, homeInfo.userHomeFloor);
    const arrangedDataMap = new Map(arrangedData.map((item) => [item.seq, item.harvestData]));

    // THỰC THI THUẬT TOÁN GÁN DUY NHẤT THEO TIMELINE
    const assignedMedicineCodes = new Set<string>();
    let allTaskHarvestList: TaskHarvestQrResDto[] = allTaskHarvestCompleteList.map((ele) => {
      // Lọc các lăn thuốc hoàn thành trước đợt thu hoạch này và chưa được gán cho đợt nào trước đó
      const currentMedicines = taskMedicineList.filter((med) => 
        moment(med.timestamp).isSameOrBefore(moment(ele.timestamp)) && !assignedMedicineCodes.has(med.medicineTaskAlarmCode)
      );

      // Đánh dấu các lăn thuốc này đã được gán
      currentMedicines.forEach((med) => assignedMedicineCodes.add(med.medicineTaskAlarmCode));

      return {
        harvestTaskAlarmCode: ele.harvestTaskAlarmCode,
        harvestPhase: ele.harvestPhase,
        harvestYear: ele.harvestYear,
        harvestData: arrangedDataMap.get(ele.seq) || [],
        timestamp: moment(ele.timestamp).format('DD-MM-YYYY HH:mm:ss'),
        medicinesFollowHarvest: currentMedicines.map((med) => med.medicineTaskAlarmCode),
      } as any;
    });

    // NẾU CÓ PARAM harvestPhase > 0, LỌC LẠI CHỈ LẤY ĐỢT ĐƯỢC CHỌN
    let finalTaskHarvestList = allTaskHarvestList;
    let targetHarvestComplete = allTaskHarvestCompleteList;
    if (harvestPhase > 0) {
      finalTaskHarvestList = allTaskHarvestList.filter((h) => h.harvestPhase === harvestPhase);
      targetHarvestComplete = allTaskHarvestCompleteList.filter((h) => h.harvestPhase === harvestPhase);
    }

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
      taskMedicineList: taskMedicineList.map((med) => ({
        ...med,
        timestamp: moment(med.timestamp).format('DD-MM-YYYY HH:mm:ss'),
      })),
      taskHarvestList: finalTaskHarvestList,
      seqHarvestPhase: targetHarvestComplete.length > 0 ? targetHarvestComplete[0].seq : undefined,
    } as GetInfoToRequestQrcodeResDto & { seqHarvestPhase?: number };
  }

  async validateHarvestBeforeRequestQr(userCode: string) {
    const logbase = `${this.SERVICE_NAME}/validateHarvestBeforeRequestQr:`;

    const result = await this.qrRequestAppRepository.validateHarvestBeforeRequestQr(userCode);
    const list = result.map((item) => {
      const harvestAvaliableList = typeof item.harvestAvaliableList === 'string' ? JSON.parse(item.harvestAvaliableList) : (item.harvestAvaliableList || []);
      return {
        userHomeCode: item.userHomeCode,
        userHomeName: item.userHomeName,
        isHarvestAvaliable: harvestAvaliableList.length > 0,
        harvestAvaliableList: harvestAvaliableList,
      };
    });

    return {
      total: list.length,
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

      console.log({ dataInsertDto }); 
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

      // Lấy đợt thu hoạch đã chọn ( đã được lọc bởi param harvestPhase ở hàm getInfoToRequestQrcode)
      const targetHarvest = dataInsertDto.taskHarvestList[0];
      const medicineCodesToMark = targetHarvest.medicinesFollowHarvest || [];

      // Chỉ giữ lại những lần lăn thuốc thuộc đợt thu hoạch này để lưu vào DB và đánh dấu isUse = 'Y'
      dataInsertDto.taskMedicineList = dataInsertDto.taskMedicineList.filter((m) => medicineCodesToMark.includes(m.medicineTaskAlarmCode));

      // tìm tất cả file đã upload cùng uniqueId
      const filesUploaded = await this.qrRequestAppRepository.findFilesByUniqueId(dto.uniqueId);
      if (filesUploaded.length) {
        // dánh đấu các lăn thuốc là đã dùng
        if (dataInsertDto.taskMedicineList.length) {
          for (const med of dataInsertDto.taskMedicineList) {
            await this.todoMedicineAppService.useTaskMedicineForQr(user.userCode, dataInsertDto.userHomeCode, med.medicineTaskAlarmCode);
          }
        }
        // dánh dấu đợt thu hoạch là đã dùng
        await this.todoHarvestAppService.useTaskHarvestForQr(user.userCode, dataInsertDto.userHomeCode, dataInsertDto.seqHarvestPhase);

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
        // sendEmail
        this.mailService.sendRequestQrEmail({
          userHomeName: dataInsertDto.userHomeName,
          userName: user.userName,
          userPhone: user.userPhone,
          harverstPhase: dto.harvestPhase,
        });
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
    // cập nhập lại isUse = 'N' cho đợt thu hoạch của requestQr này
    await this.todoHarvestAppService.unuseTaskHarvestForQr(userCode, requestInfo.userHomeCode, requestInfo.seqHarvestPhase);
    // cập nhập lại isUse = 'N' cho các lần lăn thuốc của requestQr này
    const taskMedicineList = requestInfo.taskMedicineList as any;
    if (taskMedicineList?.length) {
      for (const med of taskMedicineList) {
        await this.todoMedicineAppService.unuseTaskMedicineForQr(userCode, requestInfo.userHomeCode, med.medicineTaskAlarmCode);
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
