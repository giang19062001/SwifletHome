import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoHarvestAppRepository } from './todo-harvest.repository';
import {
  AdjustHarvestTaskDto,
  FloorDataInputDto,
  GetInfoTaskHarvestForAdjustDto,
  GetListTaskHarvestForAdjustDto,
  HarvestDataInputDto,
  HarvestDataRowInputDto,
  SetHarvestTaskDto,
} from './todo.dto';
import { GetInfoTaskHarvestForAdjustResDto, GetListTaskHarvestResDto, GetTaskHarvestResDto } from './todo.response';

@Injectable()
export class TodoHarvestAppService {
  private readonly SERVICE_NAME = 'TodoHarvestAppService';

  constructor(
    private readonly todoHarvestAppRepository: TodoHarvestAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) { }

  // ─── HARVEST ROWS ─────────────────────────────────────────────────────────

  async insUpDelHarvestRows(userCode: string, userHomeCode: string, seqHarvestPhase: number, harvestData: HarvestDataInputDto[]) {
    const harvestCurrentDatas = await this.todoHarvestAppRepository.getTaskHarvestRows(seqHarvestPhase, false);

    if (harvestCurrentDatas.length) {
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

      const requestMap = new Map<string, HarvestDataRowInputDto>();
      requestRows.forEach((r) => requestMap.set(`${r.floor}_${r.cell}`, r));

      const dbMap = new Map<string, HarvestDataRowInputDto>();
      harvestCurrentDatas.forEach((r) => dbMap.set(`${r.floor}_${r.cell}`, r));

      const toInsert: HarvestDataRowInputDto[] = [];
      const toUpdate: HarvestDataRowInputDto[] = [];
      const toDelete: HarvestDataRowInputDto[] = [];

      for (const [key, requestRow] of requestMap.entries()) {
        if (dbMap.has(key)) {
          toUpdate.push(requestRow);
        } else {
          toInsert.push(requestRow);
        }
      }
      for (const [key, dbRow] of dbMap.entries()) {
        if (!requestMap.has(key)) {
          toDelete.push(dbRow);
        }
      }

      await Promise.all(toInsert.map((row) => this.todoHarvestAppRepository.insertTaskHarvestRows(row)));
      await Promise.all(toUpdate.map((row) => this.todoHarvestAppRepository.updateTaskHarvestRows(row)));
      await Promise.all(toDelete.map((row) => this.todoHarvestAppRepository.deleteTaskHarvestRows(row.seqHarvestPhase, row.floor, row.cell, userCode, userHomeCode)));
    } else {
      if (harvestData.length) {
        let harvestDataRows: HarvestDataRowInputDto[] = [];
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
          await Promise.all(harvestDataRows.map((row) => this.todoHarvestAppRepository.insertTaskHarvestRows(row)));
        }
      }
    }
  }

  async arrangeHarvestRows(seqHarvestPhase: number, userHomeFloor: number): Promise<HarvestDataInputDto[]> {
    const harvestRows = await this.todoHarvestAppRepository.getTaskHarvestRows(seqHarvestPhase, true);

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
    return harvestData;
  }

  // ─── SET TASK HARVEST ─────────────────────────────────────────────────────

  async setTaskHarvest(userCode: string, dto: SetHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskHarvest:`;
    try {
      let result = 1;

      // Tìm nhà chính của user
      const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
      if (!mainHomeOfUser) {
        this.logger.error(logbase, `Main home của user này không có`);
        throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
      }

      // ─── KHỞI TẠO MỚI ─────────────────────────────────────────────────
      if (!dto.taskAlarmCode || String(dto.taskAlarmCode).trim() === '') {
        const isDone = dto.isComplete === YnEnum.Y ? YnEnum.Y : YnEnum.N;
        const taskStatus = dto.isComplete === YnEnum.Y ? TaskStatusEnum.COMPLETE : TaskStatusEnum.WAITING;
        const taskDate = moment(dto.harvestNextDate).toDate();

        const seqHarvestPhase = await this.todoHarvestAppRepository.insertTaskHarvestPhase(
          userCode, mainHomeOfUser.userHomeCode, dto.harvestPhase, isDone, taskDate, taskStatus,
        );
        this.logger.log(logbase, `Tạo đợt thu hoạch mới seqHarvestPhase(${seqHarvestPhase})`);

        await this.insUpDelHarvestRows(userCode, mainHomeOfUser.userHomeCode, seqHarvestPhase, dto.harvestData);
      } else {
        // ─── CẬP NHẬT ─────────────────────────────────────────────────────
        const phaseDetail = await this.todoHarvestAppRepository.getOneTaskHarvestPhase(Number(dto.taskAlarmCode));
        if (!phaseDetail) {
          this.logger.error(logbase, `seqHarvestPhase(${dto.taskAlarmCode}) không có dữ liệu`);
          result = -1;
          return result;
        }

        if (phaseDetail.taskStatus == TaskStatusEnum.COMPLETE) {
          this.logger.error(logbase, `seqHarvestPhase(${dto.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
          result = -2;
          return result;
        }

        // Cập nhật ngày thu hoạch kế tiếp
        await this.todoHarvestAppRepository.updateTaskHarvestDate(
          userCode, phaseDetail.seq, moment(dto.harvestNextDate).format('YYYY-MM-DD'),
        );
        this.logger.log(logbase, `Cập nhật taskDate seqHarvestPhase(${phaseDetail.seq})`);

        // Cập nhật dữ liệu tầng/ô
        await this.insUpDelHarvestRows(userCode, phaseDetail.userHomeCode ?? mainHomeOfUser.userHomeCode, phaseDetail.seq, dto.harvestData);

        // Hoàn thành tất cả
        if (dto.isComplete === YnEnum.Y) {
          await this.todoHarvestAppRepository.completeTaskHarvestPhase(userCode, phaseDetail.userHomeCode ?? mainHomeOfUser.userHomeCode, phaseDetail.seq, dto.harvestPhase);
          this.logger.log(logbase, `Hoàn thành đợt thu hoạch seqHarvestPhase(${phaseDetail.seq})`);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }

  // ─── GET TASK HARVEST ─────────────────────────────────────────────────────

  async getTaskHarvest(userCode: string, seqHarvestPhaseStr: string): Promise<GetTaskHarvestResDto | number> {
    const logbase = `${this.SERVICE_NAME}/getTaskHarvest:`;

    // lấy nhà chính của user
    const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
    if (!mainHomeOfUser) {
      this.logger.error(logbase, `Main home của user này không có`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }

    // lấy floor của nhà yến
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
    if (seqHarvestPhaseStr && String(seqHarvestPhaseStr).trim() !== '') {
      phaseDetail = await this.todoHarvestAppRepository.getOneTaskHarvestPhase(Number(seqHarvestPhaseStr));
      if (!phaseDetail) {
        this.logger.error(logbase, `seqHarvestPhase(${seqHarvestPhaseStr}) không có dữ liệu`);
        return 0;
      }
      if (phaseDetail.taskStatus == TaskStatusEnum.COMPLETE) {
        this.logger.error(logbase, `seqHarvestPhase(${seqHarvestPhaseStr}) ${Msg.AlreadyCompleteCannotDo}`);
        return -4;
      }
    }

    // lấy dữ liệu tầng/ô
    const harvestData: HarvestDataInputDto[] = await this.arrangeHarvestRows(phaseDetail?.seq ?? 0, homeArea.userHomeFloor);
    const harvestPhase = await this.todoHarvestAppRepository.getMaxHarvestPhase(mainHomeOfUser.userHomeCode);

    const result: GetTaskHarvestResDto = {
      userHomeName: mainHomeOfUser.userHomeName,
      taskAlarmCode: phaseDetail ? String(phaseDetail.seq) : '',
      harvestNextDate: phaseDetail?.taskDate ?? moment().format('YYYY-MM-DD'),
      harvestPhase,
      isComplete: 'N',
      harvestData,
    };
    return result;
  }

  // ─── ADJUST ───────────────────────────────────────────────────────────────

  async getInfoTaskHarvestForAdjust(userCode: string, dto: GetInfoTaskHarvestForAdjustDto): Promise<GetInfoTaskHarvestForAdjustResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getInfoTaskHarvestForAdjust:`;
    const homeInfo = await this.userHomeAppService.getDetail(dto.userHomeCode);
    if (!homeInfo) {
      this.logger.error(logbase, `Nhà yến ko có dữ liệu userHomeCode(${dto.userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }
    if (homeInfo.userCode !== userCode) {
      this.logger.error(logbase, `Nhà yến không thuộc về user hiện tại userHomeCode(${dto.userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    let taskHarvestComplete = await this.todoHarvestAppRepository.getTaskHarvestCompleteAndNotUseOne(dto.userHomeCode, dto.harvestPhase, dto.harvestYear);
    const harvestData = taskHarvestComplete ? await this.arrangeHarvestRows(taskHarvestComplete.seq, homeInfo.userHomeFloor) : [];

    return {
      seq: dto.seq,
      userHomeCode: dto.userHomeCode,
      harvestData,
    } as GetInfoTaskHarvestForAdjustResDto;
  }

  async adjustTaskHarvest(userCode: string, dto: AdjustHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/adjustTaskHarvest:`;
    try {
      let result = 1;
      const isNotUsed = await this.todoHarvestAppRepository.checkTaskHarvestCompleteAndNotUse(dto.seq);
      if (!isNotUsed) {
        this.logger.error(logbase, `${Msg.ThisHarvestRequestQrcodeAlreadyCannotAdjust}`);
        result = -1;
      }
      await this.insUpDelHarvestRows(userCode, dto.userHomeCode, dto.seq, dto.harvestData);
      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }

  async getListTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<{ total: number; list: GetListTaskHarvestResDto[] }> {
    const total = await this.todoHarvestAppRepository.getTotalTaskHarvestForAdjust(dto, userCode);
    const list = await this.todoHarvestAppRepository.getListTaskHarvestForAdjust(dto, userCode);
    return { total, list };
  }

  async getTaskHarvestCompleteAndNotUseList(userHomeCode: string, harvestPhase: number) {
    return await this.todoHarvestAppRepository.getTaskHarvestCompleteAndNotUseList(userHomeCode, harvestPhase);
  }
}
