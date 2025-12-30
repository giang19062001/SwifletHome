import { Module } from "@nestjs/common";
import { TodoAdminController } from "./todo.controller";
import { AuthAdminModule } from "src/modules/auth/admin/auth.module";
import { TodoAdminService } from "./todo.service";
import { TodoAdminRepository } from "./todo.repository";
import { UserAdminModule } from "src/modules/user/admin/user.module";
import { UserHomeAdminModule } from "src/modules/userHome/admin/userHome.module";
import { NotificationAdminModule } from "src/modules/notification/admin/notification.module";

@Module({
  imports: [AuthAdminModule, UserAdminModule, UserHomeAdminModule, NotificationAdminModule],
  controllers: [TodoAdminController],
  providers: [TodoAdminService, TodoAdminRepository],
  exports:[TodoAdminService]
})
export class TodoAdminModule{}
