import { BadRequestException, Injectable } from '@nestjs/common';
import { IHarvestTask, ITodoHomeTaskAlram, ITodoHomeTaskPeriod, ITodoTask, ITodoTaskMedicine, TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';
import { LoggingService } from 'src/common/logger/logger.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { SetHarvestTaskDto, FloorDataDto, HarvestDataDto, HarvestDataRowDto, SetTaskAlarmDto, SetTaskMedicineDto, SetTaskPeriodDto, SetTaskPeriodV2Dto } from './todo.dto';
import { Msg } from 'src/helpers/message.helper';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';
import moment from 'moment';
import TodoAppValidate from './todo.validate';
import { QUERY_HELPER } from 'src/helpers/const.helper';
import { OptionService } from 'src/modules/options/option.service';
import { IOpition, OPTION_CONST } from 'src/modules/options/option.interface';
import { GetTaskHarvestResDto, GetTasksMedicineResDto } from './todo.response';

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
  // hàm insert lịch nhắc lăn thuốc
  async insertTaskMedicineNextime(today: moment.Moment, isToday: boolean, userCode: string, userHomeCode: string, task: ITodoTask, dto: SetTaskMedicineDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskMedicine:`;

    const logbaseChild = `${logbase}::insertTaskMedicineNextime:`;
    let resultChild = 0;
    try {
      const taskDateNextTime = moment(dto.medicineNextDate).toDate();

      const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
        userHomeCode: userHomeCode,
        taskPeriodCode: null,
        taskCode: task.taskCode,
        taskName: task.taskName,
        taskNote: '',
        taskStatus: isToday ? TaskStatusEnum.COMPLETE : TaskStatusEnum.WAITING,
        taskDate: taskDateNextTime,
      };

      // insert lịch nhắc alarm sau với taskCode của LĂN THUỐC
      const seqNextTime = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
      this.logger.log(
        logbaseChild,
        `Tạo Lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) 
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

    // kiểm tra medicineOptionCode
    const attendCodes = await this.optionService.getAll({
      mainOption: OPTION_CONST.TODO_TASK.mainOption,
      subOption: OPTION_CONST.TODO_TASK.subOption,
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

    // kiểm tra task phải là 'lăn thuốc'
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

    // kiểm tra ngày chọn có trùng ngày hôm nay
    // ! TEST
    // const today = moment('2026-01-21').startOf('day');
    const today = moment().startOf('day');
    const isToday = today.isSame(moment(dto.medicineNextDate, 'YYYY-MM-DD'), 'day');
    this.logger.log(logbase, isToday ? `Lịch chọn trùng ngày hôm này` : `Lịch chọn không trùng ngày hôm này`);

    // chưa có dữ liệu có sẵn
    if (dto.taskAlarmCode == '') {
      result = await this.insertTaskMedicineNextime(today, isToday, userCode, mainHomeOfUser.userHomeCode, task, dto);
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

      // update tbl_todo_home_task_medicine
      const affectedRows = await this.todoAppRepository.updateTaskMedicine(userCode, mainHomeOfUser.userHomeCode, dto.taskAlarmCode, dto);
      if (affectedRows) {
        this.logger.log(logbase, `Cập nhập dữ liệu Medicin lăn thuốc`);
        result = 1; // thành công
      }

      // nếu ngày chọn  != ngày hôm nay
      if (!isToday) {
        // cập nhập status của taskAlarmCode hiện tại thành 'SKIP'
        await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.SKIP, userCode, dto.taskAlarmCode);
        this.logger.log(logbase, `Cập nhập trạng thái Alram lăn thuốc hiện tài thành 'Bỏ qua'`);

        // insert lịch nhắc alarm mới với taskCode của lăn thuốc
        result = await this.insertTaskMedicineNextime(today, isToday, userCode, mainHomeOfUser.userHomeCode, task, dto);
      } else {
        // nếu ngày chọn  == ngày hôm nay
        // cập nhập status của taskAlarmCode hiện tại thành 'COMPLETE'
        await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
        this.logger.log(logbase, `Cập nhập trạng thái Alram lăn thuốc hiện tài thành 'Hoàn thành'`);
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
      medicineUsage: '',
      medicineNextDate: moment().format('YYYY-MM-DD'),
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
          medicineUsage: result?.medicineUsage,
          medicineNextDate: moment(result?.medicineNextDate).format('YYYY-MM-DD'),
        };
      } else {
        return DEFAULT_VALUE;
      }
    }
  }
  // TODO: COMPLETE-HARVER
  async InsUpDelHarvestRows(userCode: string, userHomeCode: string, taskAlarmCode: string, harvestData: HarvestDataDto[]) {
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    const isOnlyActive = false; // -> lấy luôn cả cell bị isActive = 'N'
    const harvestCurrentDatas = await this.todoAppRepository.getTaskHarvests(taskAlarmCode, isOnlyActive);

    // insert / update/ detele dữ liệu tầng ô hiện cp1
    if (harvestCurrentDatas.length) {
      // biến dữ liệu lồng từ request thành row
      const requestRows: IHarvestTask[] = [];
      for (const flo of harvestData) {
        for (const cel of flo.floorData) {
          requestRows.push({
            taskAlarmCode: taskAlarmCode,
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
      const requestMap = new Map<string, IHarvestTask>();
      requestRows.forEach((r) => requestMap.set(`${r.floor}_${r.cell}`, r));

      // map từ database
      const dbMap = new Map<string, IHarvestTask>();
      harvestCurrentDatas.forEach((r) => dbMap.set(`${r.floor}_${r.cell}`, r));

      const toInsert: IHarvestTask[] = [];
      const toUpdate: IHarvestTask[] = [];
      const toDelete: IHarvestTask[] = [];

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
        await this.todoAppRepository.deleteTaskCompleteHarvest(row.taskAlarmCode, row.floor, row.cell, userCode, userHomeCode);
      }
    } else {
      // insert mới toàn bộ dữ liệu tầng ô
      if (harvestData.length) {
        let harvestDataRows: HarvestDataRowDto[] = [];
        for (const flo of harvestData) {
          const floor = flo.floor;
          if (flo.floorData.length) {
            for (const cel of flo.floorData) {
              const row: HarvestDataRowDto = {
                taskAlarmCode: taskAlarmCode,
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
          for (const row of harvestDataRows) {
            await this.todoAppRepository.insertTaskHarvest(row);
          }
        }
      }
    }
  }
  async setTaskHarvest(userCode: string, dto: SetHarvestTaskDto): Promise<number> {
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

      await this.InsUpDelHarvestRows(userCode, alramDetail.userHomeCode, dto.taskAlarmCode, dto.harvestData);
    }

    return 1;
  }
  async getTaskHarvest(userCode: string, taskAlarmCode: string): Promise<GetTaskHarvestResDto | number> {
    const logbase = `${this.SERVICE_NAME}/getTaskHarvest:`;

    // lấy thông tin alram
    const alramHarvestDetail = await this.todoAppRepository.getOneTaskHarvest(taskAlarmCode);

    // taskAlarmCode này không phải thu hoạch
    if (taskAlarmCode != '' && alramHarvestDetail?.taskKeyword !== TODO_CONST.TASK_BOX.HARVEST.value) {
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
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) - nhà yến(${alramHarvestDetail?.userHomeCode ?? ''}) ${Msg.HomeOfAlarmNotExist}`);
      return -2;
    }
    // số tầng của nhà yến là 0
    if (homeArea.userHomeFloor == 0) {
      this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) - nhà yến(${alramHarvestDetail?.userHomeCode ?? ''}) ${Msg.FloorOfHomeIsZero}`);
      return -3;
    }
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    let harvestData: HarvestDataDto[] = [];
    const isOnlyActive = true; // -> chỉ lấy cell  isActive = 'Y'
    const harvestsCurrent = await this.todoAppRepository.getTaskHarvests(taskAlarmCode, isOnlyActive);
    console.log('harvestsCurrent---', harvestsCurrent);
    if (!harvestsCurrent.length) {
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

      for (const row of harvestsCurrent) {
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
    const result: GetTaskHarvestResDto = {
      taskAlarmCode: taskAlarmCode,
      userCode: userCode,
      userHomeCode: taskAlarmCode !== '' ? (alramHarvestDetail?.userHomeCode ?? '') : mainHomeOfUser.userHomeCode,
      harvestNextDate:
        taskAlarmCode !== ''
          ? alramHarvestDetail?.harvestNextDate instanceof Date
            ? moment(alramHarvestDetail?.harvestNextDate).format('YYYY-MM-DD')
            : (alramHarvestDetail?.harvestNextDate ?? '')
          : moment().format('YYYY-MM-DD'),
      harvestPhase: alramHarvestDetail?.harvestPhase ?? 1,
      isComplete: 'N',
      harvestData: harvestData,
    };
    return result;
  }
}
