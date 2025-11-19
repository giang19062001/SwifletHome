import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { DoctorAdminController } from "./doctor.controller";
import { DoctorAdminRepository } from "./doctor.repository";
import { DoctorAdminService } from "./doctor.service";

@Module({
  imports: [AuthAdminModule],
  controllers: [DoctorAdminController],
  providers: [DoctorAdminService, DoctorAdminRepository],
  exports:[DoctorAdminRepository]
})
export class DoctorAdminModule {}
