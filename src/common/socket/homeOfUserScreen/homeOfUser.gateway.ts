import { MqttService } from './../../mqtt/mqtt.service';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ISensor } from '../socket.interface';
import { LoggingService } from '../../logger/logger.service';
import { JoinRoomDto, LeaveRoomDto } from './homeOfUser.dto';

@WebSocketGateway({
  namespace: 'socket/homeOfUser',
  transports: ['websocket'],
  cors: { origin: '*' },
})
export class HomeOfUserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly SERVICE_NAME = 'SocketGateway/homeOfUser';
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
    const { userCode, userHomeCode } = data;
    if (!userCode) return;
    if (!userHomeCode) return;

    // lưu tạm dữ liệu cho biến socket
    const intervalName = `${userCode}-${userHomeCode}`;
    client.data.intervalName = intervalName;

    const room = `HOME-${intervalName}-ROOM`;
    client.join(room);

    this.logger.log(this.SERVICE_NAME, `${client.id} đã vào phòng: ${room}`);

    // Khởi tạo interval nếu chưa có
    if (!this.socketIntervals.has(intervalName)) {
      this.startSensorDataInterval(intervalName, userHomeCode, room);
    }

    // Gửi dữ liệu rỗng lần đầu
    this.sendInitialData(client);
  }

  // gửi sensor data cho client
  private sendSensorData(room: string, payload: ISensor) {
    // this.logger.log(this.SERVICE_NAME, `streamSensorData: ${JSON.stringify(payload)}`);
    console.log(this.SERVICE_NAME, `streamSensorData: ${JSON.stringify(payload)}`);
    this.server.to(room).emit('streamSensorData', payload);
  }

  // rời phòng -> xóa interval
  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() data: LeaveRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCode } = data;
    if (!userCode) return;
    if (!userHomeCode) return;

    const room = `HOME-${userCode}-${userHomeCode}-ROOM`;
    client.leave(room);
    this.cleanupUserInterval(client);
    this.logger.log(this.SERVICE_NAME, `${client.id} đã rời phòng: ${room}`);
  }

  // khởi tạo internal khi chưa có
  private startSensorDataInterval(intervalName: string, userHomeCode: string, room: string) {
    const interval = setInterval(() => {
      const sensorData = this.mqttService.getLatestSensorData(`MAC-${intervalName}`);
      this.sendSensorData(room, sensorData);
    }, this.INTERVALS_TIME);

    this.socketIntervals.set(intervalName, interval);
    this.logger.log(this.SERVICE_NAME, `Đã khởi tạo interval cho với tên: ${intervalName}`);
  }


  // gửi mảng rỗng khi khởi tạo
  private sendInitialData(client: Socket) {
    client.emit('streamSensorData', {
      temperature: 0,
      humidity: 0,
      current: 0,
    });
  }

  // xóa interval
  private cleanupUserInterval(client: Socket) {
    const intervalName = client.data?.intervalName as string;
    if (!intervalName) return;

    const room = `HOME-${intervalName}-ROOM`;
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
