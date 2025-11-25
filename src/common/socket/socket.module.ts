import { Module } from "@nestjs/common";
import { HomesOfUserGateway } from "./homesOfUserScreen/homesOfUser.gateway";
import { MainHomeOfUserGateway } from "./mainHomeOfUserScreen/mainHomeOfUser.gateway";

@Module({
  imports: [],
  providers: [HomesOfUserGateway, MainHomeOfUserGateway],
})
export class SocketModule {}