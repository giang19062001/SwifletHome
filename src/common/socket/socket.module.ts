import { Module } from "@nestjs/common";
import { HomesOfUserGateway } from "./homesOfUserScreen/homesOfUser.gateway";
import { HomeOfUserGateway } from "./homeOfUserScreen/homeOfUser.gateway";
import { MqttModule } from "../mqtt/mqtt.module";

@Module({
  imports: [MqttModule],
  providers: [HomesOfUserGateway, HomeOfUserGateway],
})
export class SocketModule {}