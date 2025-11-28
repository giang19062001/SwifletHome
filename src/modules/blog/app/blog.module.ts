import { Module } from "@nestjs/common";
import { AuthAppModule } from "src/modules/auth/app/auth.module";
import { BlogAppController } from "./blog.controller";
import { BlogAppService } from "./blog.service";
import { BlogAdppRepository } from "./blog.repository";

@Module({
  imports: [AuthAppModule],
  controllers: [BlogAppController],
  providers: [BlogAppService, BlogAdppRepository],
  exports:[BlogAppService]
})
export class BlogAppModule {}
