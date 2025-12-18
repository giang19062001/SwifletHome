import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ISensorHome } from '../socket.interface';
import { LoggingService } from '../../logger/logger.service';
import { JoinRoomDto, LeaveRoomDto } from './homesOfUser.dto';
import { MqttService } from 'src/common/mqtt/mqtt.service';

@WebSocketGateway({
  namespace: 'socket/homesOfUser',
  transports: ['websocket'],
  cors: { origin: '*' },
})
export class HomesOfUserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly SERVICE_NAME = 'SocketGateway/homesOfUser';
  private readonly INTERVALS_TIME = 5000;
  private socketIntervals = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly mqttService: MqttService,
    private readonly logger: LoggingService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Mở kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Đóng kết nối: ${client.id}`);

    // Dọn dẹp interval khi client disconnect bất ngờ ( mất internet,... )
    this.cleanupUserInterval(client);
  }

  // tham gia nhóm
  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCodes } = data;
    if (!userCode) return;

    // lưu tạm dữ liệu cho biến socket
    const intervalName = `${userCode}`;
    client.data.intervalName = intervalName;

    const room = `USER-${intervalName}-ROOM`;
    client.join(room);

    this.logger.log(this.SERVICE_NAME, `${client.id} đã vào phòng: ${room}`);

    // Khởi tạo interval nếu chưa có
    if (!this.socketIntervals.has(intervalName)) {
      this.startSensorDataInterval(intervalName, userHomeCodes, room);
    }

    // Gửi dữ liệu rỗng lần đầu
    this.sendInitialData(client);
  }

  // gửi sensor data cho client
  private sendSensorData(room: string, payload: ISensorHome[]) {
    // this.logger.log(this.SERVICE_NAME, `streamSensorData: ${JSON.stringify(payload)}`);
    console.log(this.SERVICE_NAME, `streamSensorData: ${JSON.stringify(payload)}`);
    this.server.to(room).emit('streamSensorData', payload);
  }

  // rời phòng -> xóa interval
  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() data: LeaveRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode } = data;
    if (!userCode) return;

    const room = `USER-${userCode}-ROOM`;
    client.leave(room);
    this.cleanupUserInterval(client);
    this.logger.log(this.SERVICE_NAME, `${client.id} đã rời phòng: ${room}`);
  }

  // khởi tạo internal khi chưa có
  private startSensorDataInterval(intervalName: string, userHomeCodes: string[], room: string) {
    const interval = setInterval(() => {
      console.log("userHomeCodes", userHomeCodes, intervalName);
      const sensorData = this.generateListSensorData(userHomeCodes, intervalName);
      this.sendSensorData(room, sensorData);
    }, this.INTERVALS_TIME);

    this.socketIntervals.set(intervalName, interval);
    this.logger.log(this.SERVICE_NAME, `Đã khởi tạo interval cho tên: ${intervalName}`);
  }

  // lấy dữ liệu fake
  private generateListSensorData(userHomeCodes: string[], userCode: string): ISensorHome[] {
    return userHomeCodes.map((homeCode) => ({
      userHomeCode: homeCode,
      ...this.mqttService.getLatestSensorData(`MAC-${userCode}-${homeCode}`)
    }));
  }

  // gửi mảng rỗng khi khởi tạo
  private sendInitialData(client: Socket) {
    client.emit('streamSensorData', []);
  }

  // xóa interval
  private cleanupUserInterval(client: Socket) {
    const intervalName = client.data?.intervalName as string;
    if (!intervalName) return;

    const room = `USER-${intervalName}-ROOM`;
    const roomClients = this.server.sockets.adapter?.rooms?.get(room);

    if (!roomClients || roomClients.size === 0) {
      const interval = this.socketIntervals.get(intervalName);
      if (interval) {
        clearInterval(interval);
        this.socketIntervals.delete(intervalName);
        this.logger.log(this.SERVICE_NAME, `Đã xóa interval của tên: ${intervalName}`);
      }
    }
  }
}
