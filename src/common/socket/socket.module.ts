import { Module } from "@nestjs/common";
import { MqttModule } from "../mqtt/mqtt.module";
import { HomeOfUserGateway } from "./homeOfUserScreen/homeOfUser.gateway";
import { HomesOfUserGateway } from "./homesOfUserScreen/homesOfUser.gateway";

@Module({
  imports: [MqttModule],
  providers: [HomesOfUserGateway, HomeOfUserGateway],
})
export class SocketModule {}