import { Module } from '@nestjs/common';
import TodoAppController from './todo.controller';
import { TodoAppService } from './todo.service';
import { TodoAppRepository } from './todo.repository';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';


@Module({
  imports: [AuthAppModule],
  controllers: [TodoAppController],
  providers: [TodoAppService, TodoAppRepository],
  exports: []
})
export class TodoAppModule {}