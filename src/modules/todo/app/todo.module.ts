import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { TodoHarvestMedicineAppService } from 'src/modules/todo/app/todo-harvest-medicine.service';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import { TodoAlarmAppService } from './todo-alarm.service';
import { TodoAlarmAppRepository } from './todo-alram.repository';
import { TodoHarvestMedicineAppRepository } from './todo-harvest-medicine.repository.ts';
import TodoAppController from './todo.controller';
import TodoAppControllerV2 from './todo.controller.v2';
import TodoAppValidate from './todo.validate';


@Module({
  imports: [AuthAppModule, UserHomeAppModule],
  controllers: [TodoAppController, TodoAppControllerV2],
  providers: [TodoAlarmAppService, TodoAlarmAppRepository, TodoHarvestMedicineAppService, TodoHarvestMedicineAppRepository, TodoAppValidate],
  exports: [TodoAlarmAppService, TodoHarvestMedicineAppService]
})
export class TodoAppModule {}