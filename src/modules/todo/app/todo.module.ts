import { Module } from '@nestjs/common';
import TodoAppController from './todo.controller';
import { TodoAppService } from './todo.service';
import { TodoAppRepository } from './todo.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { UserHomeAppModule } from 'src/modules/userHome/app/userHome.module';
import TodoAppValidate from './todo.validate';


@Module({
  imports: [AuthAppModule, UserHomeAppModule],
  controllers: [TodoAppController],
  providers: [TodoAppService, TodoAppRepository, TodoAppValidate],
  exports: [TodoAppService, TodoAppRepository, TodoAppValidate]
})
export class TodoAppModule {}