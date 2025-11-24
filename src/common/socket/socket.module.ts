import { Module } from "@nestjs/common";
import { UserHomesSocket } from "./userHomes.socket";

@Module({
  imports: [],
  providers: [UserHomesSocket],
})
export class SocketModule {}