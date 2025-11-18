import { Module } from "@nestjs/common";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { InfoAdminController } from "./info.controller";
import { InfoAdminService } from "./info.service";
import { InfoAdminRepository } from "./info.repository";
import { FileLocalModule } from "src/common/fileLocal/fileLocal.module";

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [InfoAdminController],
  providers: [InfoAdminService, InfoAdminRepository],
  exports: [InfoAdminService],
})
export class InfoAdminModule {}
