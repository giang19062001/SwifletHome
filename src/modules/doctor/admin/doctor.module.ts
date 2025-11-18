import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { DoctorAdminController } from "./doctor.controller";
import { DoctorAdminRepository } from "./doctor.repository";
import { DoctorAdminService } from "./doctor.service";
import { FileLocalModule } from "src/common/fileLocal/fileLocal.module";

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [DoctorAdminController],
  providers: [DoctorAdminService, DoctorAdminRepository],
})
export class DoctorAdminModule {}
