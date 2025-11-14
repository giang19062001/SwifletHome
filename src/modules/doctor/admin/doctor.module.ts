import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { DoctorAdminController } from "./doctor.controller";
import { DoctorAdminRepository } from "./doctor.repository";
import { DoctorAdminService } from "./doctor.service";
import { UploadAdminModule } from "src/modules/upload/upload.module";

@Module({
  imports: [AuthAdminModule, UploadAdminModule],
  controllers: [DoctorAdminController],
  providers: [DoctorAdminService, DoctorAdminRepository],
})
export class DoctorAdminModule {}
