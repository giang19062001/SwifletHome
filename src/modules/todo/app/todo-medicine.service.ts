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
      const selectedDate = moment(dto.medicineNextDate).startOf('day');

      // ─── TẠO MỚI (chưa có medicineCode) ────────────────────────────────
      if (!currentMedicineCode) {
        const isToday = today.isSame(selectedDate, 'day');
        const status = isToday ? TaskStatusEnum.COMPLETE : TaskStatusEnum.WAITING;

        const { medicineCode } = await this.todoMedicineAppRepository.insertTaskMedicine(
          userCode, userHomeCode, selectedDate.toDate(), status, dto,
        );
        this.logger.log(logbase, `Tạo lịch nhắc lăn thuốc medicineCode(${medicineCode}) - Trạng thái: ${status}`);
        result = 1;
      } else {
        // ─── CẬP NHẬT (đã có medicineCode) ──────────────────────────────
        // 1. Luôn cập nhật thông tin chung (medicineOptionCode, medicineUsage,...)
        await this.todoMedicineAppRepository.updateTaskMedicine(userCode, userHomeCode, currentMedicineCode, dto);

        const prevDate = currentTaskDate ? moment(currentTaskDate).startOf('day') : null;
        const isTodayWithDto = today.isSame(selectedDate, 'day');

        if (isTodayWithDto) {
          // Ngày chọn là hôm nay -> Đánh dấu bản ghi hiện tại là COMPLETE
          await this.todoMedicineAppRepository.changeMedicineStatus(userCode, userHomeCode, currentMedicineCode, TaskStatusEnum.COMPLETE);
          await this.todoMedicineAppRepository.updateMedicineTaskDate(userCode, userHomeCode, currentMedicineCode, today.format('YYYY-MM-DD'));
          this.logger.log(logbase, `Đánh dấu COMPLETE + taskDate = today cho medicineCode(${currentMedicineCode})`);
        } else {
          // Ngày chọn là tương lai
          const isPostponed = selectedDate.isAfter(prevDate ?? today, 'day');

          if (isPostponed) {
            // Dời lịch xa hơn -> Đánh dấu task cũ là COMPLETE và tạo bản ghi mới WAITING
            await this.todoMedicineAppRepository.changeMedicineStatus(userCode, userHomeCode, currentMedicineCode, TaskStatusEnum.COMPLETE);
            const { medicineCode: newCode } = await this.todoMedicineAppRepository.insertTaskMedicine(
              userCode, userHomeCode, selectedDate.toDate(), TaskStatusEnum.WAITING, dto,
            );
            this.logger.log(logbase, `Postponed: Hoàn thành task cũ(${currentMedicineCode}) và tạo task mới(${newCode}) cho ngày ${selectedDate.format('YYYY-MM-DD')}`);
          } else {
            // Dời lịch sớm hơn hoặc giữ nguyên -> Chỉ cập nhật ngày cho bản ghi hiện tại
            await this.todoMedicineAppRepository.updateMedicineTaskDate(userCode, userHomeCode, currentMedicineCode, selectedDate.format('YYYY-MM-DD'));
            this.logger.log(logbase, `Cập nhật ngày nhắc cho medicineCode(${currentMedicineCode}) -> ${selectedDate.format('YYYY-MM-DD')}`);
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
