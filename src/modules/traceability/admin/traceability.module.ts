import { Module } from '@nestjs/common';
import { AuthAdminModule } from 'src/modules/auth/admin/auth.module';
import { TraceabilityAdminController } from './traceability.controller';
import { TraceabilityAdminRepository } from './traceability.repository';
import { TraceabilityAdminService } from './traceability.service';
import { TraceabilityFieldsAdminService } from './traceability-fields.service';

@Module({
  imports: [AuthAdminModule],
  controllers: [TraceabilityAdminController],
  providers: [TraceabilityAdminService, TraceabilityAdminRepository, TraceabilityFieldsAdminService],
  exports: [TraceabilityAdminService, TraceabilityFieldsAdminService],
})
export class TraceabilityAdminModule {}
