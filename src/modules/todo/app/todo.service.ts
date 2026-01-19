import { BadRequestException, Injectable } from '@nestjs/common';
import { ICompleteHarvestTask, IHarvestTaskRow, ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, ITodoTaskMedicine, TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { CompleteHarvestTaskDto, FloorDataDto, HarvestDataDto, HarvestDataRowDto, SetTaskAlarmDto, SetTaskMedicineDto, SetTaskPeriodDto, SetTaskPeriodV2Dto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';
import moment from 'moment';
import TodoAppValidate from './todo.validate';
import { QUERY_HELPER } from 'src/helpers/const.helper';
import { OptionService } from 'src/modules/options/option.service';
import { IOpition } from 'src/modules/options/option.interface';
import { GetTasksMedicineResDto } from './todo.response';

@Injectable()
export class TodoAppService {
  private readonly SERVICE_NAME = 'TodoAppService';

  constructor(
    private readonly todoAppRepository: TodoAppRepository,
    private readonly todoAppValidate: TodoAppValidate,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) {}

  // TODO: BOX-TASK
  async getScheduledTasks(userCode: string): Promise<{ [key: string]: string }[]> {
    const logbase = `${this.SERVICE_NAME}/getScheduledTasks:`;

    // userHomeCode -> main home
    const home = await this.userHomeAppService.getMainHomeByUser(userCode);
    const boxTasks = await this.todoAppRepository.getBoxTasks();
    if (!home || !boxTasks.length) {
      return boxTasks.map((ele) => {
        return {
          taskAlarmCode: '',
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
        const data = await this.todoAppRepository.getOneTaskAlarmsNearly(userCode, home.userHomeCode, ele.taskCode, ele.taskName, today.format('YYYY-MM-DD'));

        this.logger.log(logbase, `taskDate of (userCode:${userCode}, userHomeCode:${home.userHomeCode}, taskCode:${ele.taskCode}, taskName:${ele.taskName}) --> ${data?.taskDate}`);

        const taskAlarmCode = data?.taskAlarmCode ?? '';
        if (!data?.taskDate) {
          return {
            taskAlarmCode: taskAlarmCode,
            label: ele.taskName,
            value: '_ / _',
            date: '',
            unit: '',
          };
        } else {
          const today = moment().startOf('day');
          const taskDate = moment(data.taskDate).startOf('day');
          const diff = taskDate.diff(today, 'days');

          return {
            taskAlarmCode: taskAlarmCode,
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
  // hàm insert lịch nhắc 90 ngày sau
  async insertTaskMedicineNextime(today: moment.Moment, userCode: string, userHomeCode: string, taskCode: string, taskName: string, dto: SetTaskMedicineDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskMedicine:`;

    const logbaseChild = `${logbase}::insertTaskMedicineNextime:`;
    let resultChild = 0;
    try {
      const taskDateNextTime = today.clone().add(QUERY_HELPER.DAY_CREATE_ALARM_NEXT_TIME, 'days').toDate();

      const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
        userHomeCode: userHomeCode,
        taskPeriodCode: null,
        taskCode: taskCode,
        taskName: taskName,
        taskNote: '',
        taskStatus: TaskStatusEnum.WAITING,
        taskDate: taskDateNextTime,
      };

      // insert lịch nhắc alarm 90 ngày sau với taskCode của TODO_CONST.TASK_BOX.MEDICINE
      const seqNextTime = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
      this.logger.log(
        logbaseChild,
        `Tạo Lịch nhắc lăn thuốc cho(${QUERY_HELPER.DAY_CREATE_ALARM_NEXT_TIME}) ngày sau thành công, hiện tại (${today.toDate().toLocaleDateString()}) 
               --- (${taskDateNextTime.toLocaleDateString()})`,
      );
      if (seqNextTime) {
        // insert tbl_todo_home_task_medicine
        const affectedRows = await this.todoAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNextTime, dto);
        if (affectedRows) {
          this.logger.log(logbaseChild, `Lưu dữ liệu lăn lăn thuốc, SEQ Lần sau (${seqNextTime})`);
          resultChild = 1;
        } else {
          resultChild = 0;
        }
      } else {
        resultChild = 0;
      }
      return resultChild;
    } catch (error) {
      this.logger.error(logbaseChild, `${JSON.stringify(error)}`);
      return 0;
    }
  }
  async setTaskMedicine(userCode: string, dto: SetTaskMedicineDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskMedicine:`;

    let result = 0;
    const today = moment().startOf('day');

    // kiểm tra medicineOptionCode
    const attendCodes = await this.optionService.getAll({
      mainOption: 'TODO_TASK',
      subOption: 'MEDICINE',
    });

    if (!attendCodes.map((c) => c.code).includes(dto.medicineOptionCode)) {
      throw new BadRequestException({ message: Msg.CodeInvalid, data: 0 });
    }
    const medicineOption = attendCodes.find((ele) => ele.code === dto.medicineOptionCode);
    if (!medicineOption) {
      this.logger.error(logbase, `Medicine optione không có dữ liệu`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }
    if (medicineOption.keyOption === TODO_CONST.TASK_OPTION_MEDICINE.OTHER.value && dto.medicineOther == '') {
      this.logger.error(logbase, `Medicine other không thể trống khi mã code là 'OTHER'`);
      throw new BadRequestException({ message: Msg.CannotNull('medicineOther'), data: 0 });
    }

    // kiểm tra ngày chọn có trùng ngày hôm nay
    const isToday = today.isSame(moment(dto.medicineDate, 'YYYY-MM-DD'), 'day');
    this.logger.log(logbase, isToday ? `Lịch chọn trùng ngày hôm này` : `Lịch chọn không trùng ngày hôm này`);

    const task = await this.todoAppRepository.getTaskByKeyword(TODO_CONST.TASK_BOX.MEDICINE.value);
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
    // lăn thuốc đang chưa có giá trị khởi tạo _/_
    if (dto.taskAlarmCode == '') {
      if (isToday) {
        // insert lịch nhắc alarm 90 ngày sau với taskCode của TODO_CONST.TASK_BOX.MEDICINE
        result = await this.insertTaskMedicineNextime(today, userCode, mainHomeOfUser.userHomeCode, task.taskCode, task.taskName, dto);
      } else {
        // chỉ insert tbl_todo_home_task_medicine
        const affectedRows = await this.todoAppRepository.insertTaskMedicine(userCode, mainHomeOfUser.userHomeCode, 0, dto);
        if (affectedRows) {
          this.logger.log(logbase, `Chỉ lưu dữ liệu lăn lăn thuốc, SEQ Lần sau (${0})`);
          result = 1; // thành công
        }
      }
    } else {
      // lấy thông tin lịch nhắc lăn thuốc có sẵn đang countdown
      const alramDetail = await this.todoAppRepository.getOneTaskAlarm(dto.taskAlarmCode);
      if (!alramDetail) {
        this.logger.error(logbase, `Lịch nhắc chi tiết (alramDetail) không có dữ liệu`);
        throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
      }
      // taskAlarmCode này không phải lắn thuốc
      if (alramDetail.taskKeyword !== TODO_CONST.TASK_BOX.MEDICINE.value) {
        this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyMedicineTaskCanDo}`);
        return -1;
      }

      // taskAlarmCode này đã HOÀN THÀNH -> ko thể update
      if (alramDetail.taskStatus == TaskStatusEnum.COMPLETE) {
        this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
        return -2;
      }

      // lăn thuốc đang có giá trị countdown: 89 NGÀY
      if (isToday) {
        // cập nhập status của taskAlarmCode hiện tại thành 'COMPLETE'
        await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
        // insert lịch nhắc alarm 90 ngày sau với taskCode của TODO_CONST.TASK_BOX.MEDICINE
        result = await this.insertTaskMedicineNextime(today, userCode, mainHomeOfUser.userHomeCode, task.taskCode, task.taskName, dto);
      } else {
        // cập nhập status của taskAlarmCode hiện tại thành 'COMPLETE'
        await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);

        // chỉ update tbl_todo_home_task_medicine
        const affectedRows = await this.todoAppRepository.updateTaskMedicine(userCode, mainHomeOfUser.userHomeCode, dto.taskAlarmCode, dto);
        if (affectedRows) {
          this.logger.log(logbase, `Cập nhập dữ liệu lăn lăn thuốc, SEQ Lần sau (${0})`);
          result = 1; // thành công
        }
      }
    }

    return result;
  }
  async getTaskMedicine(taskAlarmCode: string): Promise<GetTasksMedicineResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getTaskMedicine:`;
    const DEFAULT_VALUE = {
      taskAlarmCode: '',
      medicineOptionCode: '',
      medicineOther: '',
      medicineDate: moment().format('YYYY-MM-DD'),
    };
    if (taskAlarmCode == '') {
      return DEFAULT_VALUE;
    } else {
      // lấy thông tin alram
      const result = await this.todoAppRepository.getTaskMedicine(taskAlarmCode);
      if (result) {
        // taskAlarmCode này không phải lăn thuốc
        if (result.taskKeyword !== TODO_CONST.TASK_BOX.MEDICINE.value) {
          this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.OnlyMedicineTaskCanDo}`);
          throw new BadRequestException({ message: Msg.UpdateErr, data: null });
        }

        // taskAlarmCode này đã HOÀN THÀNH -> ko thể update
        if (result.taskStatus == TaskStatusEnum.COMPLETE) {
          this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
          throw new BadRequestException({ message: Msg.AlreadyCompleteCannotDo, data: null });
        }
        return {
          taskAlarmCode: result.taskAlarmCode,
          medicineOptionCode: result?.medicineOptionCode,
          medicineOther: result?.medicineOther,
          medicineDate: moment(result?.medicineDate).format('YYYY-MM-DD'),
        };
      } else {
        return DEFAULT_VALUE;
      }
    }
  }
  // TODO: COMPLETE-HARVER
  // hàm insert lịch nhắc thu hoạch
  async insertTaskHarvestNextime(today: moment.Moment, harvestDate: Date, userCode: string, userHomeCode: string, taskCode: string, taskName: string): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/insertTaskHarvestNextime:`;

    const logbaseChild = `${logbase}::insertTaskHarvestNextime:`;
    try {
      const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
        userHomeCode: userHomeCode,
        taskPeriodCode: null,
        taskCode: taskCode,
        taskName: taskName,
        taskNote: '',
        taskStatus: TaskStatusEnum.WAITING,
        taskDate: harvestDate,
      };

      // insert lịch nhắc alarm với taskCode của TODO_CONST.TASK_BOX.HARVEST
      const seqNextTime = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
      this.logger.log(
        logbaseChild,
        `Tạo Lịch nhắc thu hoạch cho(${QUERY_HELPER.DAY_CREATE_ALARM_NEXT_TIME}) ngày sau thành công, hiện tại (${today.toDate().toLocaleDateString()}) 
               --- (${harvestDate.toLocaleDateString()})`,
      );
      return seqNextTime;
    } catch (error) {
      this.logger.error(logbaseChild, `${JSON.stringify(error)}`);
      return 0;
    }
  }
  async setTaskHarvest(userCode: string, dto: CompleteHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setCompleteTaskHarvest:`;

    if (dto.taskAlarmCode === '') {
      // khởi tạo ban đầu
    } else {
      //dữ liệu có sẵn
      const alramDetail = await this.todoAppRepository.getOneTaskAlarm(dto.taskAlarmCode);

      // taskAlarmCode này không phải là lịch nhắc chọn công việc có sẵn
      if (!alramDetail?.taskKeyword) {
        this.logger.error(logbase, `Lịch nhắc(${dto.taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
        return -1;
      }

      // taskAlarmCode này không phải thu hoạch
      if (alramDetail?.taskKeyword !== TODO_CONST.TASK_BOX.HARVEST.value) {
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
      const harvestCurrentDatas = await this.todoAppRepository.getTaskHarvests(dto.taskAlarmCode, isOnlyActive);
      if (harvestCurrentDatas.length) {
        // biến dữ liệu lồng từ request thành row
        const requestRows: IHarvestTaskRow[] = [];
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
        const requestMap = new Map<string, IHarvestTaskRow>();
        requestRows.forEach((r) => requestMap.set(`${r.floor}_${r.cell}`, r));

        // map từ database
        const dbMap = new Map<string, IHarvestTaskRow>();
        harvestCurrentDatas.forEach((r) => dbMap.set(`${r.floor}_${r.cell}`, r));

        const toInsert: IHarvestTaskRow[] = [];
        const toUpdate: IHarvestTaskRow[] = [];
        const toDelete: IHarvestTaskRow[] = [];

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
          await this.todoAppRepository.insertTaskHarvest(row);
        }

        //update
        for (const row of toUpdate) {
          await this.todoAppRepository.updateTaskHarvest(row);
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
              await this.todoAppRepository.insertTaskHarvest(row);
            }
          }
        }
      }
    }

    return 1;
  }
  async getTaskHarvest(userCode: string, taskAlarmCode: string): Promise<ICompleteHarvestTask | number> {
    const logbase = `${this.SERVICE_NAME}/getTaskHarvest:`;

    // lấy thông tin alram
    const alramDetail = await this.todoAppRepository.getOneTaskAlarm(taskAlarmCode);

    // taskAlarmCode này không phải thu hoạch
    if (taskAlarmCode != '' && alramDetail?.taskKeyword !== TODO_CONST.TASK_BOX.HARVEST.value) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.OnlyHarvestTaskCanDo}`);
      return -1;
    }

    // Tìm nhà chính của user
    const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
    if (!mainHomeOfUser) {
      this.logger.error(logbase, `Main home của user này không có`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }

    // lấy floor của nhà yến của lịch nhắc này
    const homeArea = await this.userHomeAppService.getAreaHome(mainHomeOfUser?.userHomeCode ?? '');
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
    const harvestCurrentDatas = await this.todoAppRepository.getTaskHarvests(taskAlarmCode, isOnlyActive);

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
    const result: ICompleteHarvestTask = {
      taskAlarmCode: taskAlarmCode,
      userCode: userCode,
      userHomeCode: taskAlarmCode !== '' ? (alramDetail?.userHomeCode ?? '') : mainHomeOfUser.userHomeCode,
      harvestDate: taskAlarmCode !== '' ? (alramDetail?.taskDate instanceof Date ? moment(alramDetail.taskDate).format('YYYY-MM-DD') : (alramDetail?.taskDate ?? '')) : moment().format('YYYY-MM-DD'),
      harvestData: harvestData,
    };
    return result;
  }
}
