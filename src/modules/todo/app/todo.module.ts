import { Module } from '@nestjs/common';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { TodoHarvestAppService } from 'src/modules/todo/app/todo-harvest.service';
import { TodoMedicineAppService } from 'src/modules/todo/app/todo-medicine.service';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import { TodoAlarmAppService } from './todo-alarm.service';
import { TodoAlarmAppRepository } from './todo-alram.repository';
import { TodoHarvestAppRepository } from './todo-harvest.repository';
import { TodoMedicineAppRepository } from './todo-medicine.repository';
import TodoAppController from './todo.controller';
import TodoAppControllerV2 from './todo.controller.v2';
import TodoAppValidate from './todo.validate';


@Module({
  imports: [AuthAppModule, UserHomeAppModule],
  controllers: [TodoAppController, TodoAppControllerV2],
  providers: [TodoAlarmAppService, TodoAlarmAppRepository, TodoHarvestAppService, TodoMedicineAppService, TodoHarvestAppRepository, TodoMedicineAppRepository, TodoAppValidate],
  exports: [TodoAlarmAppService, TodoHarvestAppService, TodoMedicineAppService]
})
export class TodoAppModule {}