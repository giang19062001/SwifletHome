import { Module } from "@nestjs/common";
import { HomesOfUserGateway } from "./homesOfUserScreen/homesOfUser.gateway";
import { HomeOfUserGateway } from "./homeOfUserScreen/homeOfUser.gateway";

@Module({
  imports: [],
  providers: [HomesOfUserGateway, HomeOfUserGateway],
})
export class SocketModule {}