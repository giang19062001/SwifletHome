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
import { YnEnum } from 'src/interfaces/admin.interface';

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
  // TODO: MEDICINE
  /* 
    NẾU taskAlarmCode = ""

      NẾU HÔM NAY = NGÀY CHỌN KẾ TIẾP
        -> INSERT VỚI CHẾ ĐỘ HOÀN THÀNH

      NẾU HÔM NÀY != NGÀY CHỌN KẾ TIẾP
        -> INSERT VỚI CHẾ ĐỘ CHỜ

    NẾU taskAlarmCode != ""
      NẾU HÔM NÀY = NGÀY taskDate
        -> CẬP NHẬP THUỐC, CẬP NHẬP HOÀN THÀNH

      NẾU HÔM NÀY != NGÀY taskDate
        -> CẬP NHẬP THUỐC (medicineOptionCode, medicineOther, medicineUsage)

      NẾU HÔM NÀY != NGÀY CHỌN KẾ TIẾP
        -> INSERT VỚI CHẾ ĐỘ CHỜ

      NẾU HÔM NÀY = NGÀY CHỌN KẾ TIẾP
        -> BỎ QUA
 */
  async handleTaskMedicineCurrentAndNextime(userCode: string, userHomeCode: string, taskDate: Date | null, task: ITodoTask, dto: SetTaskMedicineDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskMedicine:`;

    const logbaseChild = `${logbase}::handleTaskMedicineCurrentAndNextime:`;
    let result = 0;
    try {
      // kiểm tra ngày chọn có trùng ngày hôm nay
      const today = moment().startOf('day');
      // ! TEST
      // const today = moment('2026-01-29').startOf('day');

      // dữ liệu alarm chưa có
      if (String(dto.taskAlarmCode).trim() == '') {
        // kiểm tra trùng ngày hoặc không
        const isToday = today.isSame(moment(dto.medicineNextDate, 'YYYY-MM-DD'), 'day');
        this.logger.log(logbase, isToday ? `Ngày lăn thuốc đã thiết lập trước đó trùng ngày hôm nay -- OK` : `Lịch chọn không trùng hôm này`);

        // nếu ngày chọn lịch nhắc kế tiếp ko phải hôm nay -> insert lịch nhắc lần sau
        if (!isToday) {
          const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
            userHomeCode: userHomeCode,
            taskPeriodCode: null,
            taskCode: task.taskCode,
            taskName: task.taskName,
            taskNote: '',
            taskStatus: TaskStatusEnum.WAITING,
            taskDate: moment(dto.medicineNextDate).toDate(), // ngày lăn kế tiếp
          };
          const seqNextTime = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) --- (${moment().toDate().toLocaleDateString()})`);
          await this.todoAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNextTime, dto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc chO  lần sau SEQ(${seqNextTime})`);
        } else {
          // insert lịch nhắc cho hôm nay với trạng thái 'hoàn thành'
          const newAlarmMedicionDto: SetTaskAlarmDto = {
            userHomeCode: userHomeCode,
            taskPeriodCode: null,
            taskCode: task.taskCode,
            taskName: task.taskName,
            taskNote: '',
            taskStatus: TaskStatusEnum.COMPLETE,
            taskDate: moment().toDate(), // lăn trong ngày hôm nay
          };

          const seqNew = await this.todoAppRepository.insertTaskAlarm(userCode, newAlarmMedicionDto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) --- (${moment().toDate().toLocaleDateString()})`);
          await this.todoAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNew, dto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc chO  lần sau SEQ(${seqNew})`);
        }

        result = 1;
      } else {
        // dữ liệu alarm có sẵn

        // nếu hôm nay = ngày lịch nhắc thiết lập từ trước --> hoàn thành
        const isTodayWithSetted = today.isSame(moment(taskDate, 'YYYY-MM-DD'), 'day');
        //? Trước đó Set ngày 25 và hôm nay là 25 ---> HOÀN THÀNH
        if (isTodayWithSetted) {
          await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
          this.logger.log(logbase, `Cập nhập trạng thái taskAlarmCode(${dto.taskAlarmCode}) lăn thuốc thành 'Hoàn thành'`);
        } else {
          //? Trước đó Set ngày 25 NHƯNG hôm nay là 23 ---> SKIP
          // chưa tới ngày lăn thuốc
          this.logger.error(logbase, `${Msg.MedicineInvalidDateExecute} của taskAlarmCode(${dto.taskAlarmCode}) với hôm nay(${today.toDate()}) và ngày đã set trước đó là ${taskDate}`);
          // return -3;
        }

        // cập nhập lại taskDate bằng  dto.medicineNextDate
        // await this.todoAppRepository.updateDateOfTaskAlarm(moment(dto.medicineNextDate).format('YYYY-MM-DD'), dto.taskAlarmCode, userCode);
        // this.logger.log(logbase, `Cập nhập lại taskDate cho lịch nhắc thu hoạch taskAlarmCode(${dto.taskAlarmCode})`);

        // update lăn thuốc hiện tại
        await this.todoAppRepository.updateTaskMedicine(userCode, userHomeCode, dto.taskAlarmCode, dto);
        this.logger.log(logbase, `Cập nhập dữ liệu lăn thuốc hiện tại taskAlarmCode(${dto.taskAlarmCode})`);

        // nếu hôm nay != ngày chọn lịch nhắc cho lần sau --> insert mới với trạng thái 'WAITING'
        //? Chọn ngày 25 NHƯNG hôm nay cũng là 25 ---> KO INSERT CÁI MỚI
        //? Chọn ngày 27 NHƯNG hôm nay là 25 --->  INSERT CÁI MỚI
        const isTodayWithDto = today.isSame(moment(dto.medicineNextDate, 'YYYY-MM-DD'), 'day');
        if (!isTodayWithDto) {
          const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
            userHomeCode: userHomeCode,
            taskPeriodCode: null,
            taskCode: task.taskCode,
            taskName: task.taskName,
            taskNote: '',
            taskStatus: TaskStatusEnum.WAITING,
            taskDate: moment(dto.medicineNextDate).toDate(), // ngày lăn kế tiếp
          };
          const seqNextTime = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) --- (${moment().toDate().toLocaleDateString()})`);
          await this.todoAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNextTime, dto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc chO  lần sau SEQ(${seqNextTime})`);
        }
        result = 1;
      }

      return result;
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

    // chưa có dữ liệu có sẵn --> insert dữ liệu lăn thuốc mới
    if (String(dto.taskAlarmCode).trim() == '') {
      result = await this.handleTaskMedicineCurrentAndNextime(userCode, mainHomeOfUser.userHomeCode, null, task, dto);
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

      //  có dữ liệu có sẵn xử lý  -- >thêm / cập nhập dự liệu lăn thuốc
      result = await this.handleTaskMedicineCurrentAndNextime(userCode, mainHomeOfUser.userHomeCode, alramDetail.taskDate, task, dto);
    }

    return result;
  }
  async getTaskMedicine(taskAlarmCode: string): Promise<GetTasksMedicineResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getTaskMedicine:`;
    const DEFAULT_VALUE: GetTasksMedicineResDto = {
      taskAlarmCode: '',
      medicineOptionCode: '',
      medicineOther: '',
      medicineUsage: '',
      medicineNextDate: moment().format('YYYY-MM-DD'),
    };

    // nếu taskAlarmCode là "" -> trả giá trị default
    if (String(taskAlarmCode).trim() == '') {
      return DEFAULT_VALUE;
    } else {
      // lấy thông tin alram
      const result = await this.todoAppRepository.getTaskMedicine(taskAlarmCode);
      if (result) {
        // taskAlarmCode này không phải lăn thuốc
        if (result.taskKeyword !== TODO_CONST.TASK_BOX.MEDICINE.value) {
          this.logger.error(logbase, `Lịch nhắc(${taskAlarmCode}) ${Msg.OnlyMedicineTaskCanDo}`);
          throw new BadRequestException({ message: Msg.OnlyMedicineTaskCanDo, data: null });
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
          medicineNextDate: moment(result?.taskDate).format('YYYY-MM-DD'),
        };
      } else {
        this.logger.error(logbase, `Gía trị (${Msg.InvalidValue('taskAlarmCode')}) không hợp lệ`);
        return null;
      }
    }
  }
  // TODO: HARVER
  async insUpDelHarvestRows(userCode: string, userHomeCode: string, seq: number, harvestData: HarvestDataDto[]) {
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    const harvestCurrentDatas = await this.todoAppRepository.getTaskHarvestRows(seq, false); // false -> lấy luôn cả cell bị isActive = 'N'

    // insert / update/ detele dữ liệu tầng ô hiện có
    if (harvestCurrentDatas.length) {
      // biến dữ liệu lồng từ request thành row
      const requestRows: IHarvestTask[] = [];
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
      await Promise.all(toInsert.map((row) => this.todoAppRepository.insertTaskHarvestRows(row)));
      // update
      await Promise.all(toUpdate.map((row) => this.todoAppRepository.updateTaskHarvestRows(row)));
      // delete
      await Promise.all(toDelete.map((row) => this.todoAppRepository.deleteTaskHarvestRows(row.seqAlarm, row.floor, row.cell, userCode, userHomeCode)));
    } else {
      // insert mới toàn bộ dữ liệu tầng ô
      if (harvestData.length) {
        let harvestDataRows: HarvestDataRowDto[] = [];
        for (const flo of harvestData) {
          const floor = flo.floor;
          if (flo.floorData.length) {
            for (const cel of flo.floorData) {
              const row: HarvestDataRowDto = {
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
          await Promise.all(harvestDataRows.map((row) => this.todoAppRepository.insertTaskHarvestRows(row)));
        }
      }
    }
  }
  async arrangeHarvestRows(seq: number, userHomeFloor: number): Promise<HarvestDataDto[]> {
    // lấy dữ liệu thu hoạch của lịch nhắc này nếu có
    let harvestData: HarvestDataDto[] = [];
    const harvestRows = await this.todoAppRepository.getTaskHarvestRows(seq, true); // true -> chỉ lấy cell  isActive = 'Y'
    if (!harvestRows.length) {
      // khởi tạo Rows mặc định
      for (let i = 1; i <= userHomeFloor; i++) {
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

      for (const row of harvestRows) {
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
    return harvestData;
  }
  async setTaskHarvest(userCode: string, dto: SetHarvestTaskDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setCompleteTaskHarvest:`;
    try {
      let result = 1;

      // kiểm tra task phải là 'lăn thuốc'
      const task = await this.todoAppRepository.getTaskByKeyword(TODO_CONST.TASK_BOX.HARVEST.value);
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
        const alarmMedicionNextTimeDto: SetTaskAlarmDto = {
          userHomeCode: mainHomeOfUser.userHomeCode,
          taskPeriodCode: null,
          taskCode: task.taskCode,
          taskName: task.taskName,
          taskNote: '',
          taskStatus: dto.isComplete == 'Y' ? TaskStatusEnum.COMPLETE : TaskStatusEnum.WAITING,
          taskDate: taskDateNextTime,
        };

        // insert lịch nhắc alarm mới với taskCode của thu hoạch
        const seq = await this.todoAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);

        // insert đợt cho thu hoạch
        await this.todoAppRepository.insertTaskHarvestPhase(userCode, mainHomeOfUser.userHomeCode, seq, dto.harvestPhase, dto.isComplete == 'Y' ? YnEnum.Y : YnEnum.N);

        // insert / update/ detele dữ liệu tầng ô mới
        await this.insUpDelHarvestRows(userCode, mainHomeOfUser.userHomeCode, seq, dto.harvestData);
      } else {
        //dữ liệu có sẵn
        const alramDetail = await this.todoAppRepository.getOneTaskAlarm(dto.taskAlarmCode);

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
        await this.todoAppRepository.updateDateOfTaskAlarm(moment(dto.harvestNextDate).format('YYYY-MM-DD'), dto.taskAlarmCode, userCode);
        this.logger.log(logbase, `Cập nhập lại taskDate cho lịch nhắc thu hoạch taskAlarmCode(${dto.taskAlarmCode})`);

        // insert / update/ detele dữ liệu tầng ô
        await this.insUpDelHarvestRows(userCode, alramDetail?.userHomeCode ?? '', alramDetail?.seq ?? 0, dto.harvestData);

        // hoàn thành tất cả
        if (dto.isComplete == 'Y') {
          // cập nhập alarm là hoàn thành
          await this.todoAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
          // cập nhập đợt của alarm là Done
          await this.todoAppRepository.completeTaskHarvestPhase(userCode, alramDetail?.userHomeCode ?? '', alramDetail?.seq ?? 0, dto.harvestPhase);
        }
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, `${JSON.stringify(error)}`);
      return 0;
    }
  }
  async getTaskHarvest(userCode: string, taskAlarmCode: string): Promise<GetTaskHarvestResDto | number> {
    const logbase = `${this.SERVICE_NAME}/getTaskHarvest:`;

    // lấy thông tin alram
    const alramHarvestDetail = await this.todoAppRepository.getOneTaskHarvest(taskAlarmCode);
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
    const harvestData: HarvestDataDto[] = await this.arrangeHarvestRows(alramHarvestDetail?.seq ?? 0, homeArea.userHomeFloor);

    // lấy thông tin 'đợt' theo năm
    const harvestPhase = await this.todoAppRepository.getMaxHarvestPhase(mainHomeOfUser?.userHomeCode);
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
}
