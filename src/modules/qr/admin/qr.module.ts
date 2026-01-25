import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { QrAdminController } from "./qr.controller";
import { QrAdminService } from "./qr.service";
import { QrAdminRepository } from "./qr.repository";

@Module({
  imports: [AuthAdminModule],
  controllers: [QrAdminController],
  providers: [QrAdminService, QrAdminRepository],
  exports:[]
})
export class QrAdminModule {}
