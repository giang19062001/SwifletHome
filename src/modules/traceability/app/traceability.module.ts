import { Module } from '@nestjs/common';
import { FileLocalModule } from 'src/common/fileLocal/fileLocal.module';
import { AuthAppModule } from 'src/modules/auth/app/auth.module';
import { TraceabilityAdminModule } from '../admin/traceability.module';
import { TraceabilityAppController } from './traceability.controller';
import { TraceabilityAppRepository } from './traceability.repository';
import { TraceabilityAppService } from './traceability.service';

@Module({
  imports: [AuthAppModule, FileLocalModule, TraceabilityAdminModule],
  controllers: [TraceabilityAppController],
  providers: [TraceabilityAppService, TraceabilityAppRepository],
  exports: [TraceabilityAppService],
})
export class TraceabilityAppModule {}
