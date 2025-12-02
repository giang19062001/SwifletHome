import { Module } from "@nestjs/common";
import { TodoAdminController } from "./todo.controller";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { TodoAdminService } from "./todo.service";
import { TodoAdminRepository } from "./todo.repository";

@Module({
  imports: [AuthAdminModule],
  controllers: [TodoAdminController],
  providers: [TodoAdminService, TodoAdminRepository],
  exports:[]
})
export class TodoAdminModule{}
