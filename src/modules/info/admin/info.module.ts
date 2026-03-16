import { Module } from "@nestjs/common";
import { FileLocalModule } from "src/common/fileLocal/fileLocal.module";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { InfoAdminController } from "./info.controller";
import { InfoAdminRepository } from "./info.repository";
import { InfoAdminService } from "./info.service";

@Module({
  imports: [AuthAdminModule, FileLocalModule],
  controllers: [InfoAdminController],
  providers: [InfoAdminService, InfoAdminRepository],
  exports: [InfoAdminService],
})
export class InfoAdminModule {}
