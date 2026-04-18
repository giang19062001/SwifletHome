import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum, TODO_CONST } from '../todo.interface';
import { TodoTaskResDto } from '../todo.response';
import { TodoAlarmAppRepository } from './todo-alram.repository';
import { TodoMedicineAppRepository } from './todo-medicine.repository';
import { SetTaskMedicineDto } from './todo.dto';
import { GetTasksMedicineResDto } from './todo.response';

@Injectable()
export class TodoMedicineAppService {
  private readonly SERVICE_NAME = 'TodoMedicineAppService';

  constructor(
    private readonly todoMedicineAppRepository: TodoMedicineAppRepository,
    private readonly todoAlarmAppRepository: TodoAlarmAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) { }
  
  // TODO: MEDICINE
  async handleTaskMedicineCurrentAndNextime(userCode: string, userHomeCode: string, taskDate: Date | null, task: TodoTaskResDto, dto: SetTaskMedicineDto): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskMedicine:`;

    const logbaseChild = `${logbase}::handleTaskMedicineCurrentAndNextime:`;
    let result = 0;
    try {
      // kiểm tra ngày chọn có trùng ngày hôm nay
      const today = moment().startOf('day');
      // const today = moment('2026-01-29').startOf('day');   // ! TEST

      // dữ liệu alarm chưa có
      if (String(dto.taskAlarmCode).trim() == '') {
        // kiểm tra trùng ngày hoặc không
        const isToday = today.isSame(moment(dto.medicineNextDate, 'YYYY-MM-DD'), 'day');
        this.logger.log(logbase, (isToday ? `Lịch chọn và hôm nay giống nhau` : `Lịch chọn và hôm nay không giống nhau`) + ` ${today} - ${moment(dto.medicineNextDate, 'YYYY-MM-DD')}`);

        // nếu ngày chọn lịch nhắc kế tiếp ko phải hôm nay -> insert lịch nhắc lần sau
        if (!isToday) {
          const alarmMedicionNextTimeDto: any = {
            userHomeCode: userHomeCode,
            taskCode: task.taskCode,
            taskName: task.taskName,
            taskNote: '',
            taskStatus: TaskStatusEnum.WAITING,
            taskDate: moment(dto.medicineNextDate).toDate(), // ngày lăn kế tiếp
          };
          const seqNextTime = await this.todoAlarmAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) --- (${moment().toDate().toLocaleDateString()})`);
          await this.todoMedicineAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNextTime, dto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc chO  lần sau SEQ(${seqNextTime})`);
        } else {
          // insert lịch nhắc cho hôm nay với trạng thái 'hoàn thành'
          const newAlarmMedicionDto: any = {
            userHomeCode: userHomeCode,
            taskCode: task.taskCode,
            taskName: task.taskName,
            taskNote: '',
            taskStatus: TaskStatusEnum.COMPLETE,
            taskDate: moment().toDate(), // lăn trong ngày hôm nay
          };

          const seqNew = await this.todoAlarmAppRepository.insertTaskAlarm(userCode, newAlarmMedicionDto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) --- (${moment().toDate().toLocaleDateString()})`);
          await this.todoMedicineAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNew, dto);
          this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc chO  lần sau SEQ(${seqNew})`);
        }

        result = 1;
      } else {
        // dữ liệu alarm có sẵn

        // update lăn thuốc hiện tại (tên thuốc, liều lượng)
        await this.todoMedicineAppRepository.updateTaskMedicine(userCode, userHomeCode, dto.taskAlarmCode, dto);
        this.logger.log(logbase, `Cập nhập dữ liệu lăn thuốc hiện tại taskAlarmCode(${dto.taskAlarmCode})`);

        // nếu hôm nay = ngày lịch nhắc thiết lập từ trước --> hoàn thành
        //? Trước đó Set ngày 25 và hôm nay là 25 ---> HOÀN THÀNH
        const isTodayWithSetted = today.isSame(moment(taskDate, 'YYYY-MM-DD'), 'day');
        this.logger.log(logbase, (isTodayWithSetted ? `Lịch chọn trước đó và hôm nay giống nhau` : `Lịch chọn trước đó và hôm nay không giống nhau`) + ` ${today} - ${moment(taskDate, 'YYYY-MM-DD')}`);
        if (isTodayWithSetted) {
          await this.todoAlarmAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
          this.logger.log(logbase, `Cập nhập trạng thái taskAlarmCode(${dto.taskAlarmCode}) lăn thuốc thành 'Hoàn thành' vì đến ngày đã thiết lập`);
        }

        // nếu hôm nay = ngày chọn lịch nhắc cho lần sau --> hoàn thành
        //? Pick ngày 25 NHƯNG hôm nay cũng là 25 ---> HOÀN THÀNH
        const isTodayWithDto = today.isSame(moment(dto.medicineNextDate, 'YYYY-MM-DD'), 'day');
        this.logger.log(logbase, (isTodayWithDto ? `Lịch chọn và hôm nay giống nhau` : ` Lịch chọn và hôm nay không giống nhau`) + `${today} - ${moment(dto.medicineNextDate, 'YYYY-MM-DD')}`);
        if (isTodayWithDto) {
          // cập nhập lại status
          await this.todoAlarmAppRepository.changeTaskAlarmStatus(TaskStatusEnum.COMPLETE, userCode, dto.taskAlarmCode);
          this.logger.log(logbase, `Cập nhập trạng thái taskAlarmCode(${dto.taskAlarmCode}) lăn thuốc thành 'Hoàn thành' vì cùng ngày thiết lập`);

          // cập nhập lại taskDate là today
          await this.todoAlarmAppRepository.updateDateOfTaskAlarm(moment(today).format('YYYY-MM-DD'), dto.taskAlarmCode, userCode);
          this.logger.log(logbase, `Cập nhập lại taskDate cho lịch nhắc thu hoạch taskAlarmCode(${dto.taskAlarmCode})`);
        } else {
          // nếu hôm nay != ngày chọn lịch nhắc cho lần sau --> insert mới với trạng thái 'WAITING'
          //? Pick ngày 25 NHƯNG hôm nay cũng là 25 ---> KO INSERT CÁI MỚI
          //? Pick ngày 27 NHƯNG hôm nay là 25 --->  INSERT CÁI MỚI
          //? Pick ngày 27 NHƯNG ngày trước đó set là 28 --->  UPDATE taskDate
          const isSameBeforeWithSetted = moment(dto.medicineNextDate, 'YYYY-MM-DD').isSameOrBefore(moment(taskDate, 'YYYY-MM-DD'), 'day');
          this.logger.log(
            logbase,
            (isSameBeforeWithSetted ? `Lịch chọn nhỏ hơn hoặc bằng lịch chọn trước đó ` : `Lịch chọn lớn hơn lịch chọn trước đó `) +
            ` ${moment(dto.medicineNextDate, 'YYYY-MM-DD')} - ${moment(taskDate, 'YYYY-MM-DD')}`,
          );

          if (isSameBeforeWithSetted) {
            // cập nhập lại taskDate bằng  dto.medicineNextDate
            await this.todoAlarmAppRepository.updateDateOfTaskAlarm(moment(dto.medicineNextDate).format('YYYY-MM-DD'), dto.taskAlarmCode, userCode);
            this.logger.log(logbase, `Cập nhập lại taskDate cho lịch nhắc thu hoạch taskAlarmCode(${dto.taskAlarmCode})`);
          } else {
            const alarmMedicionNextTimeDto: any = {
              userHomeCode: userHomeCode,
              taskCode: task.taskCode,
              taskName: task.taskName,
              taskNote: '',
              taskStatus: TaskStatusEnum.WAITING,
              taskDate: moment(dto.medicineNextDate).toDate(), // ngày lăn kế tiếp
            };
            const seqNextTime = await this.todoAlarmAppRepository.insertTaskAlarm(userCode, alarmMedicionNextTimeDto);
            this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc mới thành công, hiện tại (${today.toDate().toLocaleDateString()}) --- (${moment().toDate().toLocaleDateString()})`);
            await this.todoMedicineAppRepository.insertTaskMedicine(userCode, userHomeCode, seqNextTime, dto);
            this.logger.log(logbaseChild, `Tạo lịch nhắc lăn thuốc chO  lần sau SEQ(${seqNextTime})`);
          }
        }
        result = 1;
      }

      return result;
    } catch (error) {
      this.logger.error(logbaseChild, error);
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

    // kiểm tra task phải là 'lăn thuốc'
    const task = await this.todoAlarmAppRepository.getTaskByKeyword(TODO_CONST.TASK_BOX.MEDICINE.value);
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
      const alramDetail = await this.todoAlarmAppRepository.getOneTaskAlarm(dto.taskAlarmCode);
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
      const result = await this.todoMedicineAppRepository.getTaskMedicine(taskAlarmCode);
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
        this.logger.error(logbase, `taskAlarmCode(${taskAlarmCode}) không có dữ liệu`);
        return null;
      }
    }
  }

  async getTaskMedicineCompleteAndNotUseList(userHomeCode: string) {
    return await this.todoMedicineAppRepository.getTaskMedicineCompleteAndNotUseList(userHomeCode);
  }

  async useOrUnuseTaskMedicineForQr(userCode: string, userHomeCode: string, medicineTaskAlarmCode: string, isUsed: YnEnum) {
    return await this.todoMedicineAppRepository.useOrUnuseTaskMedicineForQr(userCode, userHomeCode, medicineTaskAlarmCode, isUsed);
  }
}
