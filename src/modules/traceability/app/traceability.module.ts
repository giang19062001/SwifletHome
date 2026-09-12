import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { TodoAppModule } from 'src/modules/todo/app/todo.module';
import { TraceabilityAdminModule } from '../admin/traceability.module';
import { TraceabilityAppController } from './traceability.controller';
import { TraceabilityAppRepository } from './traceability.repository';
import { TraceabilityAppService } from './traceability.service';
import { TraceabilityFieldsService } from './traceability-fields.service';

@Module({
  imports: [AuthAppModule, FileLocalModule, TraceabilityAdminModule, TodoAppModule],
  controllers: [TraceabilityAppController],
  providers: [TraceabilityAppService, TraceabilityAppRepository, TraceabilityFieldsService],
  exports: [TraceabilityAppService, TraceabilityFieldsService],
})
export class TraceabilityAppModule {}
