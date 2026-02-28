import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { QrAdminController } from "./qr.controller";
import { QrAdminService } from "./qr.service";
import { QrAdminRepository } from "./qr.repository";
import { FileLocalModule } from "src/common/fileLocal/fileLocal.module";
import { ContractModule } from "src/common/contract/contract.module";
import { UserAdminModule } from "src/modules/user/admin/user.module";
import { QrAppModule } from "../app/qr.module";

@Module({
  imports: [AuthAdminModule, FileLocalModule, ContractModule, UserAdminModule, QrAppModule],
  controllers: [QrAdminController],
  providers: [QrAdminService, QrAdminRepository],
  exports:[QrAdminService]
})
export class QrAdminModule {}
