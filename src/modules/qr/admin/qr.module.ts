import { Module } from "@nestjs/common";
import { ContractModule } from "src/common/contract/contract.module";
import { FileLocalModule } from "src/common/fileLocal/fileLocal.module";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { UserAdminModule } from "src/modules/user/admin/user.module";
import { QrAdminController } from "./qr.controller";
import { QrAdminRepository } from "./qr.repository";
import { QrAdminService } from "./qr.service";

@Module({
  imports: [AuthAdminModule, FileLocalModule, ContractModule, UserAdminModule],
  controllers: [QrAdminController],
  providers: [QrAdminService, QrAdminRepository],
  exports:[QrAdminService]
})
export class QrAdminModule {}
