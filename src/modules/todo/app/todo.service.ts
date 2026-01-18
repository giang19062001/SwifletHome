import { Injectable } from '@nestjs/common';
import { ICompleteHarvestTask, ICompleteHarvestTaskRow, ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { CompleteHarvestTaskDto, CompleteMedicineTaskDto, FloorDataDto, HarvestDataDto, HarvestDataRowDto, SetTaskAlarmDto, SetTaskPeriodDto, SetTaskPeriodV2Dto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';
import moment from 'moment';
import TodoAppValidate from './todo.validate';
import { QUERY_HELPER } from 'src/helpers/const.helper';

@Injectable()
export class TodoAppService {
  private readonly SERVICE_NAME = 'TodoAppService';

  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly todoAppValidate: TodoAppValidate,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: BOX-TASK
  async getScheduledTasks(userCode: string, userHomeCode: string): Promise<{ [key: string]: string }[]> {
    const logbase = `${this.SERVICE_NAME}/getScheduledTasks:`;

    // userHomeCode -> main home
    const home = await this.userHomeAppService.getDetail(userHomeCode);
    const boxTasks = await this.todoAppRepository.getBoxTasks();
    if (!home || !boxTasks.length) {
      return boxTasks.map((ele) => {
        return {
          label: ele.taskName,
          value: '_ / _',
          date: '',
          unit: '',
        };
      });
    }

    const today = moment().startOf('day');

    const result = await Promise.all(
      boxTasks.map(async (ele) => {
        // const data = await this.todoAppRepository.getOneTaskAlarmsNearly(userCode, userHomeCode, ele.taskCode, ele.taskName, today.format('YYYY-MM-DD'));
        const data: { taskDate: null } = {
          taskDate: null,
        };

        this.logger.log(logbase, `taskDate of (userCode:${userCode}, userHomeCode:${userHomeCode}, taskCode:${ele.taskCode}, taskName:${ele.taskName}) --> ${data?.taskDate}`);

        if (!data?.taskDate) {
          return {
            label: ele.taskName,
            value: '_ / _',
            date: '',
            unit: '',
          };
        } else {
          const taskDate = moment(data.taskDate);
          const diff = taskDate.diff(today, 'days');

          return {
            label: ele.taskName,
            value: diff.toString(),
            date: taskDate.format('YYYY-MM-DD'),
            unit: 'ngày',
          };
        }
      }),
    );

    return result;
  }

  // TODO: TASK
  async getTasks(): Promise<ITodoTask[]> {
    const logbase = `${this.SERVICE_NAME}/getTasks:`;
    const list = await this.todoAppRepository.getTasks();
    this.logger.log(logbase, `list.length(${list.length})`);

    return list;
  }

  // TODO: ALARM
  async getListTaskAlarms(userCode: string, userHomeCode: string, dto: PagingDto): Promise<IListApp<ITodoHomeTaskAlram>> {
    const logbase = `${this.SERVICE_NAME}/getTaskAlarms:`;

    const total = await this.todoAppRepository.getTotalTaskAlarm(userCode, userHomeCode);
    const list = await this.todoAppRepository.getListTaskAlarms(userCode, userHomeCode, dto);

    return { total, list };
  }

  async changeTaskAlarmStatus(taskStatus: TaskStatusEnum, userCode: string, taskAlarmCode: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/changeTaskAlarmStatus:`;
    const result = await this.todoAppRepository.changeTaskAlarmStatus(taskStatus, userCode, taskAlarmCode);
    this.logger.log(logbase, `cập nhập trạng thái của lịch nhắc thành (${taskStatus})`);
    return result;
  }
  // TODO: PERIOD

  async setTaskAlarmPeriod(userCode: string, dto: SetTaskPeriodDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarmPeriod:`;

    // kiểm tra duplicate chu kỳ lịch nhắc
    const isDuplicatePeriod = await this.todoAppRepository.checkDuplicateTaskPeriod(userCode, dto);
    if (isDuplicatePeriod) {
      this.logger.log(logbase, Msg.DuplicateTaskPeriod + `(${dto.userHomeCode})`);
      return -2;
    }

    // kiểm tra duplicate lịch nhắc
    let alramDto = await this.todoAppValidate.handleAlarmDataByPeriodData(dto, '');

    // taskDate khác null mới kiểm tra
    if (alramDto.taskDate != null) {
      const isDuplicateAlarm = await this.todoAppRepository.checkDuplicateTaskAlarm(userCode, alramDto);
      if (isDuplicateAlarm) {
        this.logger.log(logbase, Msg.DuplicateTaskAlram + `(${dto.userHomeCode})`);
        return -1;
      }
    }

    // insert lịch nhắc theo ngày tùy chỉnh
    if (dto.isPeriod == 'N' && dto.specificValue != null) {
      alramDto.taskPeriodCode = null; // taskPeriodCode sẽ null
      const result = await this.todoAppRepository.insertTaskAlarm(userCode, alramDto);
      this.logger.log(logbase, `Đã thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến ${dto.userHomeCode}`);

      return result;
    }

    // insert lịch nhắc theo chu kỳ
    if (dto.isPeriod == 'Y' && dto.periodType != null && dto.periodValue != null) {
      const { taskPeriodCode, insertId } = await this.todoAppRepository.insertTaskPeriod(userCode, dto);

      if (alramDto.taskDate == null) {
        //* VD:  2025-02-31 - KO  HỢP LỆ,  2025-03-31 - HỢP LỆ
        this.logger.log(logbase, `Thời gian lịch nhắc không hợp lệ nhưng có thể hợp lệ vào thời điểm khác -> không thể thêm lịch nhắc, chỉ có thể thêm cấu hình chu kỳ, không thêm dữ liệu lịch nhắc`);
        return 1;
      }
      if (insertId && alramDto.taskDate != null) {
        this.logger.log(logbase, `Đã thiết lập cấu hình lịch nhắc theo chu kỳ cho nhà yến ${dto.userHomeCode}`);

        alramDto.taskPeriodCode = taskPeriodCode; // taskPeriodCode bắt buộc có
        const result = await this.todoAppRepository.insertTaskAlarm(userCode, alramDto);
        this.logger.log(logbase, `Đã thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến ${dto.userHomeCode}`);

        return result;
      }
    }
    return 0;
  }
  async setTaskAlarmPeriodV2(userCode: string, dto: SetTaskPeriodV2Dto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskAlarmPeriodV2:`;

    // kiểm tra duplicate lịch nhắc
    let alramDto = await this.todoAppValidate.handleAlarmDataByPeriodDataV2(dto, '');

    // taskDate khác null mới kiểm tra
    if (alramDto.taskDate != null) {
      const isDuplicateAlarm = await this.todoAppRepository.checkDuplicateTaskAlarm(userCode, alramDto);
      if (isDuplicateAlarm) {
        this.logger.log(logbase, Msg.DuplicateTaskAlram + `(${dto.userHomeCode})`);
        return -1;
      }
    }

    // insert lịch nhắc theo ngày tùy chỉnh
    if (dto.specificValue != null) {
      const result = await this.todoAppRepository.insertTaskAlarm(userCode, alramDto);
      this.logger.log(logbase, `Đã thêm lịch nhắc ${moment(alramDto.taskDate).format('YYYY-MM-DD')} cho nhà yến ${dto.userHomeCode}`);

      return result;
    }
    return 0;
  }
  // TODO: COMPLETE-MEDICINE

  async setCompleteTaskMedicine(userCode: string, dto: CompleteMedicineTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setCompleteTaskMedicine:`;
    const alramDetail = await this.todoAppRepository.getOneTaskAlarm(dto.taskAlarmCode);
    let result = 0;

    // taskAlarmCode này không phải là lịch nhắc chọn công việc có sẵn
    if (!alramDetail?.taskKeyword) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyMedicineTaskCanDo}`);
      return -1;
    }

    // taskAlarmCode này không phải lắn thuốc
    if (alramDetail?.taskKeyword !== TODO_CONST.TASK_EVENT.MEDICINE.value) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyMedicineTaskCanDo}`);
      return -1;
    }

    // taskAlarmCode này đã HOÀN THÀNH -> ko thể update
    if (alramDetail?.taskStatus == TaskStatusEnum.COMPLETE) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
      return -2;
    }

    // taskAlarmCode này đã được insert dữ liệu lăn thuôc rồi
    const checkDuplicate = await this.todoAppRepository.getTaskCompleteMedicine(dto.taskAlarmCode);
    if (checkDuplicate) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.MedicineTaskAlreadyAdded}`);
      return -3;
    }
    const insertId = await this.todoAppRepository.insertTaskCompleteMedicine(userCode, alramDetail.userHomeCode, dto);

    if (insertId) {
      // cập nhập trạng thái cho lịch nhắc là HOÀN THÀNH
      await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
      // tự động tạo lịch nhác này cho 3 tháng sau

      const today = moment();
      const taskDateNextTime = moment(today).add(QUERY_HELPER.DAY_CREATE_ALARM_NEXT_TIME, 'days').toDate();
      this.logger.log(logbase, `Lịch nhắc(${dto.taskAlarmCode}) hiện tại (${today.toDate().toLocaleDateString()}) --- Lần sau (${taskDateNextTime.toLocaleDateString()})`);

      const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
        userHomeCode: alramDetail.userHomeCode,
        taskPeriodCode: null,
        taskCode: alramDetail.taskCode,
        taskName: alramDetail.taskName,
        taskNote: alramDetail.taskNote,
        taskStatus: TaskStatusEnum.WAITING,
        taskDate: taskDateNextTime,
      };
      const seqNextTime = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
      if (seqNextTime) {
        const affectedRows = await this.todoAppRepository.updateTaskCompleteMedicine(userCode, dto.taskAlarmCode, seqNextTime);
        if (affectedRows) {
          this.logger.log(logbase, `Tạo Lịch nhắc tự động cho(${QUERY_HELPER.DAY_CREATE_ALARM_NEXT_TIME}) ngày sau thành công,hiện tại (${alramDetail.seq}) --- Lần sau (${seqNextTime})`);
          result = 1; // thành công
        }
      }
    }
    return result;
  }
  // TODO: COMPLETE-HARVER
  async setCompleteTaskHarvest(userCode: string, dto: CompleteHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setCompleteTaskHarvest:`;
    const alramDetail = await this.todoAppRepository.getOneTaskAlarm(dto.taskAlarmCode);

    // taskAlarmCode này không phải là lịch nhắc chọn công việc có sẵn
    if (!alramDetail?.taskKeyword) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
      return -1;
    }

    // taskAlarmCode này không phải thu hoạch
    if (alramDetail?.taskKeyword !== TODO_CONST.TASK_EVENT.HARVEST.value) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
      return -1;
    }
    // taskAlarmCode này đã HOÀN THÀNH -> ko thể update
    if (alramDetail?.taskStatus == TaskStatusEnum.COMPLETE) {
      this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
      return -2;
    }

    // kiểm tra và cập nhập trạng thái hoàn thành cho lịch nhắc
    if (dto.isComplete == 'Y') {
      await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
    }

    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    const isOnlyActive = false; // -> lấy luôn cả cell bị isActive = 'N'
    const harvestCurrentDatas = await this.todoAppRepository.getTaskCompleteHarvests(dto.taskAlarmCode, isOnlyActive);
    if (harvestCurrentDatas.length) {
      // biến dữ liệu lồng từ request thành row
      const requestRows: ICompleteHarvestTaskRow[] = [];
      for (const flo of dto.harvestData) {
        for (const cel of flo.floorData) {
          requestRows.push({
            taskAlarmCode: dto.taskAlarmCode,
            userCode: userCode,
            userHomeCode: alramDetail.userHomeCode,
            floor: flo.floor,
            cell: cel.cell,
            cellCollected: cel.cellCollected,
            cellRemain: cel.cellRemain,
          });
        }
      }

      // map từ request
      const requestMap = new Map<string, ICompleteHarvestTaskRow>();
      requestRows.forEach((r) => requestMap.set(`${r.floor}_${r.cell}`, r));

      // map từ database
      const dbMap = new Map<string, ICompleteHarvestTaskRow>();
      harvestCurrentDatas.forEach((r) => dbMap.set(`${r.floor}_${r.cell}`, r));

      const toInsert: ICompleteHarvestTaskRow[] = [];
      const toUpdate: ICompleteHarvestTaskRow[] = [];
      const toDelete: ICompleteHarvestTaskRow[] = [];

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
      for (const row of toInsert) {
        await this.todoAppRepository.insertTaskCompleteHarvest(row);
      }

      //update
      for (const row of toUpdate) {
        await this.todoAppRepository.updateTaskCompleteHarvest(row);
      }

      // delete
      for (const row of toDelete) {
        await this.todoAppRepository.deleteTaskCompleteHarvest(row.taskAlarmCode, row.floor, row.cell, userCode, alramDetail.userHomeCode);
      }
    } else {
      // INSERT
      if (dto.harvestData.length) {
        let harvestDataRows: HarvestDataRowDto[] = [];
        for (const flo of dto.harvestData) {
          const floor = flo.floor;
          if (flo.floorData.length) {
            for (const cel of flo.floorData) {
              const row: HarvestDataRowDto = {
                taskAlarmCode: dto.taskAlarmCode,
                userCode: userCode,
                userHomeCode: alramDetail.userHomeCode,
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
          for (const row of harvestDataRows) {
            await this.todoAppRepository.insertTaskCompleteHarvest(row);
          }
        }
      }
    }

    return 1;
  }
  async getCompleteTaskHarvest(userCode: string, taskAlarmCode: string): Promise<ICompleteHarvestTask | number> {
    const logbase = `${this.SERVICE_NAME}/getCompleteTaskHarvest:`;

    // lấy thông tin alram
    const alramDetail = await this.todoAppRepository.getOneTaskAlarm(taskAlarmCode);

    // taskAlarmCode này không phải là lịch nhắc chọn công việc có sẵn
    if (!alramDetail?.taskKeyword) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
      return -1;
    }

    // taskAlarmCode này không phải thu hoạch
    if (alramDetail?.taskKeyword !== TODO_CONST.TASK_EVENT.HARVEST.value) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
      return -1;
    }
    // lấy floor của nhà yến của lịch nhắc này
    const homeArea = await this.userHomeAppService.getAreaHome(alramDetail?.userHomeCode ?? '');

    // nhà yến của lịch nhắc ko tồn tại
    if (!homeArea) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) - nhà yến(${alramDetail?.userHomeCode ?? ''}) ${Msg.HomeOfAlarmNotExist}`);
      return -2;
    }
    // số tầng của nhà yến là 0
    if (homeArea.userHomeFloor == 0) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) - nhà yến(${alramDetail?.userHomeCode ?? ''}) ${Msg.FloorOfHomeIsZero}`);
      return -3;
    }
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    let harvestData: HarvestDataDto[] = [];
    const isOnlyActive = true; // -> chỉ lấy cell  isActive = 'Y'
    const harvestCurrentDatas = await this.todoAppRepository.getTaskCompleteHarvests(taskAlarmCode, isOnlyActive);

    if (!harvestCurrentDatas.length) {
      // khởi tạo mặc định
      for (let i = 1; i <= homeArea.userHomeFloor; i++) {
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
    } else {
      // lồng dữ liệu đã có
      const floorMap = new Map<number, { floor: number; floorData: FloorDataDto[] }>();

      for (const row of harvestCurrentDatas) {
        if (!floorMap.has(row.floor)) {
          floorMap.set(row.floor, { floor: row.floor, floorData: [] });
        }

        floorMap.get(row.floor)!.floorData.push({
          cell: row.cell,
          cellCollected: row.cellCollected,
          cellRemain: row.cellRemain,
        });
      }

      harvestData = Array.from(floorMap.values()).sort((a, b) => a.floor - b.floor);
    }
    const result: ICompleteHarvestTask = { taskAlarmCode: taskAlarmCode, userCode: userCode, userHomeCode: alramDetail?.userHomeCode ?? '', harvestData: harvestData };
    return result;
  }
}
