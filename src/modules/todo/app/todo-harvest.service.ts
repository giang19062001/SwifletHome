import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum } from '../common/todo.enum';
import { TodoHarvestAppRepository } from './todo-harvest.repository';
import { AdjustHarvestTaskDto, FloorDataInputDto, GetInfoTaskHarvestForAdjustDto, GetListTaskHarvestForAdjustDto, HarvestDataInputDto, HarvestDataRowInputDto, SetHarvestTaskDto } from './todo.dto';
import { GetInfoTaskHarvestForAdjustResDto, GetListTaskHarvestResDto, GetTaskHarvestResDto } from './todo.response';

@Injectable()
export class TodoHarvestAppService {
  private readonly SERVICE_NAME = 'TodoHarvestAppService';

  constructor(
    private readonly todoHarvestAppRepository: TodoHarvestAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}

  async insUpDelHarvestRows(userCode: string, userHomeCode: string, seqHarvestPhase: number, harvestData: HarvestDataInputDto[]) {
    // Lấy danh sách các dòng dữ liệu thu hoạch hiện tại trong DB cho đợt này
    const harvestCurrentDatas = await this.todoHarvestAppRepository.getTaskHarvestRows(seqHarvestPhase, false);

    if (harvestCurrentDatas.length) {
      // Chuyển đổi dữ liệu input từ dạng lồng nhau (tầng -> ô) sang dạng phẳng (từng dòng ô)
      const requestRows: HarvestDataRowInputDto[] = [];
      for (const flo of harvestData) {
        for (const cel of flo.floorData) {
          requestRows.push({
            seqHarvestPhase,
            userCode,
            userHomeCode,
            floor: flo.floor,
            cell: cel.cell,
            cellCollected: cel.cellCollected,
            cellRemain: cel.cellRemain,
          });
        }
      }

      // Tạo Map để so sánh nhanh giữa dữ liệu gửi lên và dữ liệu hiện có trong DB
      const requestMap = new Map<string, HarvestDataRowInputDto>();
      requestRows.forEach((r) => requestMap.set(`${r.floor}_${r.cell}`, r));

      const dbMap = new Map<string, HarvestDataRowInputDto>();
      harvestCurrentDatas.forEach((r) => dbMap.set(`${r.floor}_${r.cell}`, r));

      const toInsert: HarvestDataRowInputDto[] = [];
      const toUpdate: HarvestDataRowInputDto[] = [];
      const toDelete: HarvestDataRowInputDto[] = [];

      // Phân loại các dòng cần Thêm mới hoặc Cập nhật
      for (const [key, requestRow] of requestMap.entries()) {
        if (dbMap.has(key)) {
          toUpdate.push(requestRow); // Đã có trong DB -> Cập nhật
        } else {
          toInsert.push(requestRow); // Chưa có -> Thêm mới
        }
      }
      // Phân loại các dòng cần Xóa (có trong DB nhưng không có trong request gửi lên)
      for (const [key, dbRow] of dbMap.entries()) {
        if (!requestMap.has(key)) {
          toDelete.push(dbRow);
        }
      }

      // Thực thi các thao tác DB
      if (toInsert.length) await this.todoHarvestAppRepository.insertMultipleTaskHarvestRows(toInsert);
      if (toUpdate.length) await Promise.all(toUpdate.map((row) => this.todoHarvestAppRepository.updateTaskHarvestRows(row)));
      if (toDelete.length) await this.todoHarvestAppRepository.deleteMultipleTaskHarvestRows(toDelete);
    } else {
      // Trường hợp DB chưa có dữ liệu nào cho đợt này -> Thêm mới toàn bộ
      if (harvestData.length) {
        const harvestDataRows: HarvestDataRowInputDto[] = [];
        for (const flo of harvestData) {
          for (const cel of flo.floorData) {
            harvestDataRows.push({
              seqHarvestPhase,
              userCode,
              userHomeCode,
              floor: flo.floor,
              cell: cel.cell,
              cellCollected: cel.cellCollected,
              cellRemain: cel.cellRemain,
            });
          }
        }
        if (harvestDataRows.length) {
          await this.todoHarvestAppRepository.insertMultipleTaskHarvestRows(harvestDataRows);
        }
      }
    }
  }

  async arrangeHarvestRows(seqHarvestPhase: number, userHomeFloor: number): Promise<HarvestDataInputDto[]> {
    // Lấy toàn bộ dòng dữ liệu thu hoạch của đợt này từ DB
    const harvestRows = await this.todoHarvestAppRepository.getTaskHarvestRows(seqHarvestPhase, true);

    // Gom nhóm dữ liệu theo từng tầng
    const existingDataMap = new Map<number, FloorDataInputDto[]>();
    for (const row of harvestRows) {
      if (!existingDataMap.has(row.floor)) {
        existingDataMap.set(row.floor, []);
      }
      existingDataMap.get(row.floor)!.push({
        cell: row.cell,
        cellCollected: row.cellCollected,
        cellRemain: row.cellRemain,
      });
    }

    // Xây dựng danh sách dữ liệu đầy đủ cho tất cả các tầng
    const harvestData: HarvestDataInputDto[] = [];
    for (let i = 1; i <= userHomeFloor; i++) {
      if (existingDataMap.has(i)) {
        // Nếu tầng này có dữ liệu trong DB thì lấy dữ liệu đó
        harvestData.push({ floor: i, floorData: existingDataMap.get(i)! });
      } else {
        // Nếu tầng này chưa có dữ liệu, tạo một ô mặc định (cell 1) với các giá trị bằng 0
        harvestData.push({ floor: i, floorData: [{ cell: 1, cellCollected: 0, cellRemain: 0 }] });
      }
    }
    return harvestData;
  }

  /**
   * Sắp xếp và tổ chức dữ liệu thu hoạch cho nhiều đợt cùng lúc.
   * Tương tự arrangeHarvestRows nhưng tối ưu hơn khi cần xử lý danh sách nhiều đợt.
   */
  async arrangeMultipleHarvestRows(seqHarvestPhases: number[], userHomeFloor: number): Promise<{ seq: number; harvestData: HarvestDataInputDto[] }[]> {
    if (!seqHarvestPhases || !seqHarvestPhases.length) return [];

    // Lấy toàn bộ dữ liệu của tất cả các đợt trong một lần truy vấn DB duy nhất
    const allRows = await this.todoHarvestAppRepository.getMultipleTaskHarvestRows(seqHarvestPhases, true);

    // Phân loại các dòng dữ liệu theo ID của đợt thu hoạch (seqHarvestPhase)
    const rowsByPhase = new Map<number, typeof allRows>();
    for (const row of allRows) {
      if (!row.seqHarvestPhase) continue;
      if (!rowsByPhase.has(row.seqHarvestPhase)) {
        rowsByPhase.set(row.seqHarvestPhase, []);
      }
      rowsByPhase.get(row.seqHarvestPhase)!.push(row);
    }

    const result: { seq: number; harvestData: HarvestDataInputDto[] }[] = [];

    // Với mỗi đợt, thực hiện tổ chức lại dữ liệu theo tầng/ô tương tự arrangeHarvestRows
    for (const seq of seqHarvestPhases) {
      const harvestRows = rowsByPhase.get(seq) || [];
      const existingDataMap = new Map<number, FloorDataInputDto[]>();

      for (const row of harvestRows) {
        if (!existingDataMap.has(row.floor)) {
          existingDataMap.set(row.floor, []);
        }
        existingDataMap.get(row.floor)!.push({
          cell: row.cell,
          cellCollected: row.cellCollected,
          cellRemain: row.cellRemain,
        });
      }

      const harvestData: HarvestDataInputDto[] = [];
      for (let i = 1; i <= userHomeFloor; i++) {
        if (existingDataMap.has(i)) {
          harvestData.push({ floor: i, floorData: existingDataMap.get(i)! });
        } else {
          harvestData.push({ floor: i, floorData: [{ cell: 1, cellCollected: 0, cellRemain: 0 }] });
        }
      }

      result.push({ seq, harvestData });
    }

    return result;
  }

  async setTaskHarvestV2(userCode: string, dto: SetHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskHarvestV2:`;
    try {
      const result = 1;

      const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
      if (!mainHomeOfUser) {
        this.logger.error(logbase, `Main home của user này không có`);
        throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
      }
      const userHomeCode = mainHomeOfUser.userHomeCode;

      let currentPhaseSeq = 0;
      let currentHarvestPhase = dto.harvestPhase;
      let currentHarvestYear = moment().year();

      if (!dto.taskAlarmCode || String(dto.taskAlarmCode).trim() === '') {
        const taskDate = moment().toDate();
        const { seq } = await this.todoHarvestAppRepository.insertTaskHarvestPhase(userCode, userHomeCode, dto.harvestPhase, YnEnum.N, taskDate, TaskStatusEnum.COMPLETE, currentHarvestYear);
        currentPhaseSeq = seq;

        this.logger.log(logbase, `Tạo và hoàn thành đợt thu hoạch mới seqHarvestPhase(${currentPhaseSeq})`);
        await this.insUpDelHarvestRows(userCode, userHomeCode, currentPhaseSeq, dto.harvestData);
      } else {
        const phaseDetail = await this.todoHarvestAppRepository.getOneTaskHarvestPhase(dto.taskAlarmCode);
        if (!phaseDetail) {
          this.logger.error(logbase, `seqHarvestPhase(${dto.taskAlarmCode}) không có dữ liệu`);
          return -1;
        }

        if (phaseDetail.taskStatus === TaskStatusEnum.COMPLETE) {
          const isNotUsed = await this.todoHarvestAppRepository.checkTaskHarvestCompleteAndNotUse(phaseDetail.seq);
          if (!isNotUsed) {
            this.logger.error(logbase, `Đợt này đã dùng QR, ko cho update`);
            return -2;
          }
        } else {
          await this.todoHarvestAppRepository.completeTaskHarvestPhase(userCode, phaseDetail.userHomeCode ?? userHomeCode, phaseDetail.seq, dto.harvestPhase);
        }

        await this.insUpDelHarvestRows(userCode, phaseDetail.userHomeCode ?? userHomeCode, phaseDetail.seq, dto.harvestData);

        currentPhaseSeq = phaseDetail.seq;
        currentHarvestPhase = phaseDetail.harvestPhase;
        currentHarvestYear = phaseDetail.harvestYear;
      }

      const nextDateMoment = moment(dto.harvestNextDate);
      const todayMoment = moment().startOf('day');

      if (nextDateMoment.isAfter(todayMoment)) {
        let nextHarvestYear = currentHarvestYear;
        let nextHarvestPhase = currentHarvestPhase + 1;

        if (nextDateMoment.year() > currentHarvestYear) {
          nextHarvestYear = nextDateMoment.year();
          nextHarvestPhase = 1;
        }

        const existingWaitingPhase = await this.todoHarvestAppRepository.getWaitingTaskHarvestPhase(userHomeCode);

        const nextHarvestData = dto.harvestData.map((floor) => ({
          floor: floor.floor,
          floorData: floor.floorData.map((cell) => ({
            cell: cell.cell,
            cellCollected: 0,
            cellRemain: 0,
          })),
        }));

        if (existingWaitingPhase) {
          await this.todoHarvestAppRepository.updateWaitingTaskHarvestPhase(existingWaitingPhase.seq, nextHarvestPhase, nextHarvestYear, nextDateMoment.format('YYYY-MM-DD'));
          await this.insUpDelHarvestRows(userCode, userHomeCode, existingWaitingPhase.seq, nextHarvestData);
          this.logger.log(logbase, `Cập nhật đợt thu hoạch WAITING có sẵn seqHarvestPhase(${existingWaitingPhase.seq})`);
        } else {
          const { seq: nextPhaseSeq } = await this.todoHarvestAppRepository.insertTaskHarvestPhase(
            userCode,
            userHomeCode,
            nextHarvestPhase,
            YnEnum.N,
            nextDateMoment.toDate(),
            TaskStatusEnum.WAITING,
            nextHarvestYear,
          );
          await this.insUpDelHarvestRows(userCode, userHomeCode, nextPhaseSeq, nextHarvestData);
          this.logger.log(logbase, `Tạo đợt thu hoạch WAITING mới seqHarvestPhase(${nextPhaseSeq})`);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }

  async getTaskHarvest(userCode: string, harvestCode: string): Promise<GetTaskHarvestResDto | number> {
    const logbase = `${this.SERVICE_NAME}/getTaskHarvest:`;

    // Lấy thông tin nhà chính của user
    const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
    if (!mainHomeOfUser) {
      this.logger.error(logbase, `Main home của user này không có`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }

    // Lấy cấu trúc tầng của nhà yến (để biết có bao nhiêu tầng cần hiển thị)
    const homeArea = await this.userHomeAppService.getAreaHome(mainHomeOfUser.userHomeCode);
    if (!homeArea) {
      this.logger.error(logbase, `Nhà yến (${mainHomeOfUser.userHomeCode}) ${Msg.HomeOfAlarmNotExist}`);
      return -2;
    }
    if (homeArea.userHomeFloor == 0) {
      this.logger.error(logbase, `Nhà yến (${mainHomeOfUser.userHomeCode}) ${Msg.FloorOfHomeIsZero}`);
      return -3;
    }

    let phaseDetail: any = null;
    // Nếu có truyền ID đợt thu hoạch, thực hiện tìm kiếm thông tin trong DB
    if (harvestCode && String(harvestCode).trim() !== '') {
      phaseDetail = await this.todoHarvestAppRepository.getOneTaskHarvestPhase(harvestCode);
      if (!phaseDetail) {
        this.logger.error(logbase, `harvestCode(${harvestCode}) không có dữ liệu`);
        return 0;
      }
      // Kiểm tra trạng thái: nếu đã hoàn thành thì không cho xử lý tiếp ở màn hình này
      if (phaseDetail.taskStatus == TaskStatusEnum.COMPLETE) {
        this.logger.error(logbase, `harvestCode(${harvestCode}) ${Msg.AlreadyCompleteCannotDo}`);
        return -4;
      }
    }

    // Lấy và tổ chức dữ liệu các tầng/ô (nếu tạo mới thì phaseDetail?.seq là 0, sẽ trả về data mặc định)
    const harvestData: HarvestDataInputDto[] = await this.arrangeHarvestRows(phaseDetail?.seq ?? 0, homeArea.userHomeFloor);

    // Lấy phase cao nhất hiện tại của nhà yến để gợi ý phase tiếp theo
    const harvestPhase = await this.todoHarvestAppRepository.getMaxHarvestPhase(mainHomeOfUser.userHomeCode);

    // Xây dựng DTO phản hồi cho client
    const result: GetTaskHarvestResDto = {
      userHomeName: mainHomeOfUser.userHomeName,
      taskAlarmCode: phaseDetail ? phaseDetail.harvestCode : '',
      harvestNextDate: phaseDetail?.taskDate ?? moment().format('YYYY-MM-DD'),
      harvestPhase,
      isComplete: 'Y',
      harvestData,
    };
    return result;
  }

  /**
   * Lấy thông tin đợt thu hoạch đã hoàn thành nhưng chưa được sử dụng (chưa quét QR) để thực hiện hiệu chỉnh (Adjust).
   */
  async getInfoTaskHarvestForAdjust(userCode: string, dto: GetInfoTaskHarvestForAdjustDto): Promise<GetInfoTaskHarvestForAdjustResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getInfoTaskHarvestForAdjust:`;

    // Kiểm tra thông tin nhà yến
    const homeInfo = await this.userHomeAppService.getDetail(dto.userHomeCode);
    if (!homeInfo) {
      this.logger.error(logbase, `Nhà yến ko có dữ liệu userHomeCode(${dto.userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }
    // Đảm bảo nhà yến thuộc quyền quản lý của user đang thực hiện
    if (homeInfo.userCode !== userCode) {
      this.logger.error(logbase, `Nhà yến không thuộc về user hiện tại userHomeCode(${dto.userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    // Tìm kiếm đợt thu hoạch đã hoàn thành (taskStatus = 'COMPLETE') và chưa liên kết với mã QR nào
    const taskHarvestComplete = await this.todoHarvestAppRepository.getTaskHarvestCompleteAndNotUseOne(dto.userHomeCode, dto.harvestPhase, dto.harvestYear);

    // Nếu tìm thấy, lấy chi tiết tầng/ô, nếu không trả về mảng trống
    const harvestData = taskHarvestComplete ? await this.arrangeHarvestRows(taskHarvestComplete.seq, homeInfo.userHomeFloor) : [];

    const { isIntegateTempHum, isIntegateCurrent, isTriggered, uniqueId, ...cleanHomeData } = homeInfo;

    return {
      seq: dto.seq,
      userHomeCode: dto.userHomeCode,
      harvestPhase: taskHarvestComplete?.harvestPhase ?? dto.harvestPhase,
      harvestYear: taskHarvestComplete?.harvestYear ?? dto.harvestYear,
      homeData: cleanHomeData,
      harvestData,
    } as GetInfoTaskHarvestForAdjustResDto;
  }

  /**
   * Thực hiện cập nhật lại (hiệu chỉnh) dữ liệu tầng/ô cho một đợt thu hoạch đã xong.
   * Chỉ cho phép nếu đợt đó chưa được sử dụng để tạo mã QR.
   */
  async adjustTaskHarvest(userCode: string, dto: AdjustHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/adjustTaskHarvest:`;
    try {
      let result = 1;

      // Kiểm tra xem đợt này đã được sử dụng (gắn vào QR code) hay chưa
      const isNotUsed = await this.todoHarvestAppRepository.checkTaskHarvestCompleteAndNotUse(dto.seq);
      if (!isNotUsed) {
        this.logger.error(logbase, `${Msg.ThisHarvestRequestQrcodeAlreadyCannotAdjust}`);
        result = -1;
        // Chỗ này không return ngay vì logic dưới vẫn gọi insUpDelHarvestRows (có thể là bug hoặc cố ý ghi đè dù đã dùng)
      }

      // Cập nhật lại các dòng dữ liệu tầng/ô
      await this.insUpDelHarvestRows(userCode, dto.userHomeCode, dto.seq, dto.harvestData);
      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }

  /**
   * Lấy danh sách phân trang các đợt thu hoạch có thể hiệu chỉnh.
   */
  async getListTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<{ total: number; list: GetListTaskHarvestResDto[] }> {
    const total = await this.todoHarvestAppRepository.getTotalTaskHarvestForAdjust(dto, userCode);
    const list = await this.todoHarvestAppRepository.getListTaskHarvestForAdjust(dto, userCode);
    return { total, list };
  }

  async getTaskHarvestCompleteAndNotUseList(userHomeCode: string, harvestPhase: number) {
    return await this.todoHarvestAppRepository.getTaskHarvestCompleteAndNotUseList(userHomeCode, harvestPhase);
  }

  async useTaskHarvestForQr(userCode: string, userHomeCode: string, seqHarvestPhase: number): Promise<number> {
    return await this.todoHarvestAppRepository.useTaskHarvestForQr(userCode, userHomeCode, seqHarvestPhase);
  }

  async unuseTaskHarvestForQr(userCode: string, userHomeCode: string, seqHarvestPhase: number): Promise<number> {
    return await this.todoHarvestAppRepository.unuseTaskHarvestForQr(userCode, userHomeCode, seqHarvestPhase);
  }
}
