import { BadRequestException, Injectable } from '@nestjs/common';
import moment from 'moment';
import { LoggingService } from 'src/common/logger/logger.service';
import { Msg } from 'src/helpers/message.helper';
import { YnEnum } from 'src/interfaces/admin.interface';
import { OPTION_CONST } from 'src/modules/options/option.interface';
import { OptionService } from 'src/modules/options/option.service';
import { UserHomeAppService } from 'src/modules/userHome/app/userHome.service';
import { TaskStatusEnum } from '../todo.interface';
import { TodoMedicineAppRepository } from './todo-medicine.repository';
import { SetTaskMedicineDto } from './todo.dto';
import { GetTasksMedicineResDto } from './todo.response';

@Injectable()
export class TodoMedicineAppService {
  private readonly SERVICE_NAME = 'TodoMedicineAppService';

  constructor(
    private readonly todoMedicineAppRepository: TodoMedicineAppRepository,
    private readonly userHomeAppService: UserHomeAppService,
    private readonly optionService: OptionService,
    private readonly logger: LoggingService,
  ) { }

  // TODO: MEDICINE
  async handleTaskMedicine(
    userCode: string,
    userHomeCode: string,
    currentMedicineCode: string | null,
    currentTaskDate: Date | null,
    dto: SetTaskMedicineDto,
  ): Promise<number> {
    const logbase = `${this.SERVICE_NAME}/setTaskMedicine::handleTaskMedicine:`;
    let result = 0;
    try {
      const today = moment().startOf('day');
      const selectedDate = moment(dto.medicineNextDate, 'YYYY-MM-DD');

      // ─── TẠO MỚI (chưa có medicineCode) ────────────────────────────────
      if (!currentMedicineCode) {
        const isToday = today.isSame(selectedDate, 'day');
        this.logger.log(logbase, (isToday ? `Ngày chọn = hôm nay` : `Ngày chọn ≠ hôm nay`) + ` ${today.format('YYYY-MM-DD')} / ${selectedDate.format('YYYY-MM-DD')}`);

        if (!isToday) {
          // Ngày kế tiếp chưa đến → insert với WAITING
          const { medicineCode } = await this.todoMedicineAppRepository.insertTaskMedicine(
            userCode, userHomeCode, selectedDate.toDate(), TaskStatusEnum.WAITING, dto,
          );
          this.logger.log(logbase, `Tạo lịch nhắc lăn thuốc lần sau medicineCode(${medicineCode})`);
        } else {
          // Ngày chọn là hôm nay → insert COMPLETE ngay
          const { medicineCode } = await this.todoMedicineAppRepository.insertTaskMedicine(
            userCode, userHomeCode, selectedDate.toDate(), TaskStatusEnum.COMPLETE, dto,
          );
          this.logger.log(logbase, `Tạo lịch nhắc lăn thuốc hôm nay medicineCode(${medicineCode})`);
        }
        result = 1;
      } else {
        // ─── CẬP NHẬT (đã có medicineCode) ──────────────────────────────
        await this.todoMedicineAppRepository.updateTaskMedicine(userCode, userHomeCode, currentMedicineCode, dto);
        this.logger.log(logbase, `Cập nhật dữ liệu lăn thuốc medicineCode(${currentMedicineCode})`);

        const prevDate = currentTaskDate ? moment(currentTaskDate).startOf('day') : null;
        const isTodayWithSetted = prevDate ? today.isSame(prevDate, 'day') : false;
        const isTodayWithDto = today.isSame(selectedDate, 'day');

        // Nếu hôm nay đúng ngày đã thiết lập trước → COMPLETE
        if (isTodayWithSetted) {
          await this.todoMedicineAppRepository.changeMedicineStatus(userCode, userHomeCode, currentMedicineCode, TaskStatusEnum.COMPLETE);
          this.logger.log(logbase, `Đánh dấu COMPLETE medicineCode(${currentMedicineCode}) (đúng ngày đã set)`);
        }

        if (isTodayWithDto) {
          // Ngày chọn lần này cũng là hôm nay → COMPLETE
          await this.todoMedicineAppRepository.changeMedicineStatus(userCode, userHomeCode, currentMedicineCode, TaskStatusEnum.COMPLETE);
          await this.todoMedicineAppRepository.updateMedicineTaskDate(userCode, userHomeCode, currentMedicineCode, moment().format('YYYY-MM-DD'));
          this.logger.log(logbase, `Đánh dấu COMPLETE + taskDate = today medicineCode(${currentMedicineCode})`);
        } else {
          // Chọn ngày tương lai
          const isSameOrBefore = selectedDate.isSameOrBefore(prevDate ?? today, 'day');
          if (isSameOrBefore) {
            // Vào trước hoặc đúng ngày trước → update taskDate
            await this.todoMedicineAppRepository.updateMedicineTaskDate(userCode, userHomeCode, currentMedicineCode, selectedDate.format('YYYY-MM-DD'));
            this.logger.log(logbase, `Update taskDate medicineCode(${currentMedicineCode}) → ${selectedDate.format('YYYY-MM-DD')}`);
          } else {
            // Ngày mới > ngày cũ → tạo thêm lịch nhắc mới (WAITING)
            const { medicineCode: newCode } = await this.todoMedicineAppRepository.insertTaskMedicine(
              userCode, userHomeCode, selectedDate.toDate(), TaskStatusEnum.WAITING, dto,
            );
            this.logger.log(logbase, `Tạo lịch nhắc lăn thuốc mới medicineCode(${newCode})`);
          }
        }
        result = 1;
      }

      return result;
    } catch (error) {
      this.logger.error(logbase, error);
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
      this.logger.error(logbase, `Medicine option không có dữ liệu`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }

    // Tìm nhà chính của user
    const mainHomeOfUser = await this.userHomeAppService.getMainHomeByUser(userCode);
    if (!mainHomeOfUser) {
      this.logger.error(logbase, `Main home của user này không có`);
      throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
    }

    // chưa có dữ liệu có sẵn → insert
    if (!dto.taskAlarmCode || String(dto.taskAlarmCode).trim() === '') {
      result = await this.handleTaskMedicine(userCode, mainHomeOfUser.userHomeCode, null, null, dto);
    } else {
      // có medicineCode → lấy thông tin để update
      const medicineDetail = await this.todoMedicineAppRepository.getTaskMedicine(dto.taskAlarmCode);
      if (!medicineDetail) {
        this.logger.error(logbase, `medicineCode(${dto.taskAlarmCode}) không có dữ liệu`);
        throw new BadRequestException({ message: Msg.UpdateErr, data: 0 });
      }

      // Đã COMPLETE → không thể update
      if (medicineDetail.taskStatus == TaskStatusEnum.COMPLETE) {
        this.logger.error(logbase, `medicineCode(${dto.taskAlarmCode}) ${Msg.AlreadyCompleteCannotDo}`);
        return -2;
      }

      result = await this.handleTaskMedicine(
        userCode, mainHomeOfUser.userHomeCode,
        dto.taskAlarmCode,
        medicineDetail.taskDate ? new Date(medicineDetail.taskDate as any) : null,
        dto,
      );
    }

    return result;
  }

  async getTaskMedicine(medicineCode: string): Promise<GetTasksMedicineResDto | null> {
    const logbase = `${this.SERVICE_NAME}/getTaskMedicine:`;
    const DEFAULT_VALUE: GetTasksMedicineResDto = {
      taskAlarmCode: '',
      medicineOptionCode: '',
      medicineOther: '',
      medicineUsage: '',
      medicineNextDate: moment().format('YYYY-MM-DD'),
    };

    if (!medicineCode || String(medicineCode).trim() === '') {
      return DEFAULT_VALUE;
    }

    const result = await this.todoMedicineAppRepository.getTaskMedicine(medicineCode);
    if (result) {
      if (result.taskStatus == TaskStatusEnum.COMPLETE) {
        this.logger.error(logbase, `medicineCode(${medicineCode}) ${Msg.AlreadyCompleteCannotDo}`);
        throw new BadRequestException({ message: Msg.AlreadyCompleteCannotDo, data: null });
      }
      return {
        taskAlarmCode: result.medicineCode,
        medicineOptionCode: result?.medicineOptionCode,
        medicineOther: result?.medicineOther,
        medicineUsage: result?.medicineUsage,
        medicineNextDate: moment(result?.taskDate).format('YYYY-MM-DD'),
      };
    } else {
      this.logger.error(logbase, `medicineCode(${medicineCode}) không có dữ liệu`);
      return null;
    }
  }

  async getTaskMedicineCompleteAndNotUseList(userHomeCode: string) {
    return await this.todoMedicineAppRepository.getTaskMedicineCompleteAndNotUseList(userHomeCode);
  }

  async useOrUnuseTaskMedicineForQr(userCode: string, userHomeCode: string, medicineCode: string, isUsed: YnEnum) {
    return await this.todoMedicineAppRepository.useOrUnuseTaskMedicineForQr(userCode, userHomeCode, medicineCode, isUsed);
  }
}
