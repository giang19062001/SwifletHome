import { Module } from '@nestjs/common';
import { FileLocalModule } from '../fileLocal/fileLocal.module';
import { CornService } from './corn.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DoctorAdminModule } from 'src/modules/doctor/admin/doctor.module';

@Module({
  imports: [ScheduleModule.forRoot(), FileLocalModule, DoctorAdminModule],
  controllers: [],
  providers: [CornService],
  exports: [],
})
export class CornModule {}
