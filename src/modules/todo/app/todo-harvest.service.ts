import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoAlarmAppRepository } from './todo-alram.repository';
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
    private readonly todoAlarmAppRepository: TodoAlarmAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) { }

  // TODO: HARVERT
  async insUpDelHarvestRows(userCode: string, userHomeCode: string, seq: number, harvestData: HarvestDataInputDto[]) {
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    const harvestCurrentDatas = await this.todoHarvestAppRepository.getTaskHarvestRows(seq, false); // false -> lấy luôn cả cell bị isActive = 'N'

    // insert / update/ detele dữ liệu tầng ô hiện có
    if (harvestCurrentDatas.length) {
      // biến dữ liệu lồng từ request thành row
      const requestRows: HarvestDataRowInputDto[] = [];
      for (const flo of harvestData) {
        for (const cel of flo.floorData) {
          requestRows.push({
            seqAlarm: seq,
            userCode: userCode,
            userHomeCode: userHomeCode,
            floor: flo.floor,
            cell: cel.cell,
            cellCollected: cel.cellCollected,
            cellRemain: cel.cellRemain,
          });
        }
      }

      // map từ request
      const requestMap = new Map<string, HarvestDataRowInputDto>();
      requestRows.forEach((r) => requestMap.set(`${r.floor}_${r.cell}`, r));

      // map từ database
      const dbMap = new Map<string, HarvestDataRowInputDto>();
      harvestCurrentDatas.forEach((r) => dbMap.set(`${r.floor}_${r.cell}`, r));

      const toInsert: HarvestDataRowInputDto[] = [];
      const toUpdate: HarvestDataRowInputDto[] = [];
      const toDelete: HarvestDataRowInputDto[] = [];

      // so sánh
      for (const [key, requestRow] of requestMap.entries()) {
        if (dbMap.has(key)) {
          toUpdate.push(requestRow); // row sẽ insert
        } else {
          toInsert.push(requestRow); // row sẽ update
        }
      }

      for (const [key, dbRow] of dbMap.entries()) {
        if (!requestMap.has(key)) {
          toDelete.push(dbRow); // row sẽ xóa
        }
      }
      // insert
      await Promise.all(toInsert.map((row) => this.todoHarvestAppRepository.insertTaskHarvestRows(row)));
      // update
      await Promise.all(toUpdate.map((row) => this.todoHarvestAppRepository.updateTaskHarvestRows(row)));
      // delete
      await Promise.all(toDelete.map((row) => this.todoHarvestAppRepository.deleteTaskHarvestRows(row.seqAlarm, row.floor, row.cell, userCode, userHomeCode)));
    } else {
      // insert mới toàn bộ dữ liệu tầng ô
      if (harvestData.length) {
        let harvestDataRows: HarvestDataRowInputDto[] = [];
        for (const flo of harvestData) {
          const floor = flo.floor;
          if (flo.floorData.length) {
            for (const cel of flo.floorData) {
              const row: HarvestDataRowInputDto = {
                seqAlarm: seq,
                userCode: userCode,
                userHomeCode: userHomeCode,
                floor: floor,
                cell: cel.cell,
                cellCollected: cel.cellCollected,
                cellRemain: cel.cellRemain,
              };
              harvestDataRows.push(row);
            }
          }
        }
        if (harvestDataRows.length) {
          await Promise.all(harvestDataRows.map((row) => this.todoHarvestAppRepository.insertTaskHarvestRows(row)));
        }
      }
    }
  }
  async arrangeHarvestRows(seq: number, userHomeFloor: number): Promise<HarvestDataInputDto[]> {
    const harvestRows = await this.todoHarvestAppRepository.getTaskHarvestRows(seq, true); // true -> chỉ lấy cell  isActive = 'Y'

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

    // tạo mảng kết quả dựa trên userHomeFloor
    const harvestData: HarvestDataInputDto[] = [];

    for (let i = 1; i <= userHomeFloor; i++) {
      if (existingDataMap.has(i)) {
        // nếu tầng này đã có dữ liệu trong DB -> Lấy dữ liệu đó
        harvestData.push({
          floor: i,
          floorData: existingDataMap.get(i)!,
        });
      } else {
        // nếu tầng này chưa có -> Khởi tạo Row mặc định với cell 1
        harvestData.push({
          floor: i,
          floorData: [
            {
              cell: 1,
              cellCollected: 0,
              cellRemain: 0,
            },
          ],
        });
      }
    }

    return harvestData;
  }

  async setTaskHarvest(userCode: string, dto: SetHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskHarvest:`;
    try {
      let result = 1;

      // kiểm tra task phải là 'thu hoạch'
      const task = await this.todoAlarmAppRepository.getTaskByKeyword(TODO_CONST.TASK_BOX.HARVEST.value);
      if (!task) {
        this.logger.error(logbase, `Task không có dữ liệu`);
        throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
      }

      // Tìm nhà chính của user
      const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
      if (!mainHomeOfUser) {
        this.logger.error(logbase, `Main home của user này không có`);
        throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
      }

      // khởi tạo ban đầu
      if (String(dto.taskAlarmCode).trim() === '') {
        const taskDateNextTime = moment(dto.harvestNextDate).toDate();

        // nếu checked 'hoàn thành tất cả' ---> Hoàn thành
        const alarmMedicionNextTimeDto: any = {
          userHomeCode: mainHomeOfUser.userHomeCode,
          taskCode: task.taskCode,
          taskName: task.taskName,
          taskNote: '',
          taskStatus: dto.isComplete == 'Y' ? TaskStatusEnum.COMPLETE : TaskStatusEnum.WAITING,
          taskDate: taskDateNextTime,
        };

        // insert lịch nhắc alarm mới với taskCode của thu hoạch
        const seq = await this.todoAlarmAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);

        // insert đợt cho thu hoạch
        await this.todoHarvestAppRepository.insertTaskHarvestPhase(userCode, mainHomeOfUser.userHomeCode, seq, dto.harvestPhase, dto.isComplete == 'Y' ? YnEnum.Y : YnEnum.N);

        // insert / update/ detele dữ liệu tầng ô mới
        await this.insUpDelHarvestRows(userCode, mainHomeOfUser.userHomeCode, seq, dto.harvestData);
      } else {
        //dữ liệu có sẵn
        const alramDetail = await this.todoAlarmAppRepository.getOneTaskAlarm(dto.taskAlarmCode);

        // taskAlarmCode này không phải là lịch nhắc chọn công việc có sẵn
        if (!alramDetail?.taskKeyword) {
          this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
          result = -1;
        }

        // taskAlarmCode này không phải thu hoạch
        if (alramDetail?.taskKeyword !== TODO_CONST.TASK_BOX.HARVEST.value) {
          this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
          result = -1;
        }
        // taskAlarmCode này đã HOÀN THÀNH -> ko thể update
        if (alramDetail?.taskStatus == TaskStatusEnum.COMPLETE) {
          this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
          result = -2;
        }

        // cập nhập lại taskDate bằng  dto.harvestNextDate
        await this.todoAlarmAppRepository.updateDateOfTaskAlarm(moment(dto.harvestNextDate).format('YYYY-MM-DD'), dto.taskAlarmCode, userCode);
        this.logger.log(logbase, `Cập nhập lại taskDate cho lịch nhắc thu hoạch taskAlarmCode(${dto.taskAlarmCode})`);

        // insert / update/ detele dữ liệu tầng ô
        await this.insUpDelHarvestRows(userCode, alramDetail?.userHomeCode ?? '', alramDetail?.seq ?? 0, dto.harvestData);

        // hoàn thành tất cả
        if (dto.isComplete == 'Y') {
          // cập nhập alarm là hoàn thành
          await this.todoAlarmAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
          // cập nhập đợt của alarm là Done
          await this.todoHarvestAppRepository.completeTaskHarvestPhase(userCode, alramDetail?.userHomeCode ?? '', alramDetail?.seq ?? 0, dto.harvestPhase);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }
  async getInfoTaskHarvestForAdjust(userCode: string, dto: GetInfoTaskHarvestForAdjustDto): Promise<GetInfoTaskHarvestForAdjustResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getInfoTaskHarvestForAdjust:`;
    // lấy thông tin nhà
    const homeInfo = await this.userHomeAppService.getDetail(dto.userHomeCode);
    if (!homeInfo) {
      this.logger.error(logbase, `Nhà yến ko có dữ liệu userHomeCode(${dto.userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }
    if (homeInfo.userCode !== userCode) {
      this.logger.error(logbase, `Nhà yến ko không thuộc về user hiện tại userHomeCode(${dto.userHomeCode})`);
      throw new BadRequestException({ message: Msg.HomeNotFound, data: null });
    }

    // lấy thông tin thu hoạch nhà yến này với đợt, năm này
    let taskHarvestComplete = await this.todoHarvestAppRepository.getTaskHarvestCompleteAndNotUseOne(dto.userHomeCode, dto.harvestPhase, dto.harvestYear);
    const harvestData = taskHarvestComplete ? await this.arrangeHarvestRows(taskHarvestComplete.seq, homeInfo.userHomeFloor) : [];

    return {
      seq: dto.seq,
      userHomeCode: dto.userHomeCode,
      harvestData: harvestData,
    } as GetInfoTaskHarvestForAdjustResDto;
  }
  async adjustTaskHarvest(userCode: string, dto: AdjustHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/adjustTaskHarvest:`;
    try {
      let result = 1;

      // kiểm tra đợt thu hoạch này đã dùng yêu cầu qrcode hay chưa
      const isNotUsed = await this.todoHarvestAppRepository.checkTaskHarvestCompleteAndNotUse(dto.seq);
      if (isNotUsed == false) {
        this.logger.error(logbase, `${Msg.ThisHarvestRequestQrcodeAlreadyCannotAdjust}`);
        result = -1;
      }

      // insert / update/ detele dữ liệu tầng ô
      await this.insUpDelHarvestRows(userCode, dto.userHomeCode, dto.seq, dto.harvestData);

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
      return 0;
    }
  }
  async getTaskHarvest(userCode: string, taskAlarmCode: string): Promise<GetTaskHarvestResDto | number> {
    const logbase = `${this.SERVICE_NAME}/getTaskHarvest:`;

    // lấy thông tin alram
    const alramHarvestDetail = await this.todoHarvestAppRepository.getOneTaskHarvest(taskAlarmCode);
    if (String(taskAlarmCode).trim() !== '' && alramHarvestDetail == null) {
      this.logger.error(logbase, `Không có thông tin thu hoạch của mã code taskAlarmCode(${taskAlarmCode})`);
      return 0;
    }
    // taskAlarmCode này đã HOÀN THÀNH -> ko thể update
    if (alramHarvestDetail && alramHarvestDetail.taskStatus == TaskStatusEnum.COMPLETE) {
      this.logger.error(logbase, `Lịch nhắc(${alramHarvestDetail.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
      return -4;
    }

    // taskAlarmCode này không phải thu hoạch
    if (String(taskAlarmCode).trim() !== '' && alramHarvestDetail && alramHarvestDetail.taskKeyword !== TODO_CONST.TASK_BOX.HARVEST.value) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
      return -1;
    }

    // lấy nhà chính của user
    const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
    if (!mainHomeOfUser) {
      this.logger.error(logbase, `Main home của user này không có`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }

    // lấy floor của nhà yến của lịch nhắc này
    const homeArea = await this.userHomeAppService.getAreaHome(mainHomeOfUser?.userHomeCode ?? '');
    if (!homeArea) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) - nhà yến(${alramHarvestDetail?.userHomeCode ?? ''}) ${Msg.HomeOfAlarmNotExist}`);
      return -2;
    }
    // số tầng của nhà yến là 0
    if (homeArea.userHomeFloor == 0) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) - nhà yến(${alramHarvestDetail?.userHomeCode ?? ''}) ${Msg.FloorOfHomeIsZero}`);
      return -3;
    }
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    const harvestData: HarvestDataInputDto[] = await this.arrangeHarvestRows(alramHarvestDetail?.seq ?? 0, homeArea.userHomeFloor);

    // lấy thông tin 'đợt' theo năm
    const harvestPhase = await this.todoHarvestAppRepository.getMaxHarvestPhase(mainHomeOfUser?.userHomeCode);
    const result: GetTaskHarvestResDto = {
      userHomeName: mainHomeOfUser.userHomeName,
      taskAlarmCode: String(taskAlarmCode).trim() !== '' && alramHarvestDetail != null ? taskAlarmCode : '',
      harvestNextDate:
        String(taskAlarmCode).trim() !== '' && alramHarvestDetail?.taskDate
          ? moment(alramHarvestDetail.taskDate).isValid()
            ? moment(alramHarvestDetail.taskDate).format('YYYY-MM-DD')
            : moment().format('YYYY-MM-DD')
          : moment().format('YYYY-MM-DD'),
      harvestPhase: harvestPhase, // mặc định là đợt 1 nếu ko có
      isComplete: 'N', // hoàn thành tất cả mặc định là 'N'
      harvestData: harvestData, // dữ liệu tầng / ô
    };
    return result;
  }

  async getListTaskHarvestForAdjust(dto: GetListTaskHarvestForAdjustDto, userCode: string): Promise<{ total: number; list: GetListTaskHarvestResDto[] }> {
    const total = await this.todoHarvestAppRepository.getTotalTaskHarvestForAdjust(dto, userCode);
    const list = await this.todoHarvestAppRepository.getListTaskHarvestForAdjust(dto, userCode);
    return { total: total, list: list };
  }

  async getTaskHarvestCompleteAndNotUseList(userHomeCode: string, harvestPhase: number) {
    return await this.todoHarvestAppRepository.getTaskHarvestCompleteAndNotUseList(userHomeCode, harvestPhase);
  }
}
