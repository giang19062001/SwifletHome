import { Module } from "@nestjs/common";
import { SearchModule } from "src/common/search/search.module";
import { AuthAppModule } from "src/modules/auth/app/auth.module";
import { BlogAppController } from "./blog.controller";
import { BlogAdppRepository } from "./blog.repository";
import { BlogAppService } from "./blog.service";

@Module({
  imports: [AuthAppModule, SearchModule],
  controllers: [BlogAppController],
  providers: [BlogAppService, BlogAdppRepository],
  exports:[BlogAppService]
})
export class BlogAppModule {}
