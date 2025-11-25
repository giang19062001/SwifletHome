import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SensorData } from './socket.interface';
import { LoggingService } from '../logger/logger.service';
import { JoinUserHomesRoomDto, LeaveUserHomesRoomDto, UserHomeSensorDataDto } from './socket.dto';

@WebSocketGateway({
  namespace: 'socket/userHomes',
  transports: ['websocket'],
  cors: { origin: '*' },
})
export class UserHomesSocket implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly SERVICE_NAME = 'SocketGateway/UserHomes';
  private readonly INTERVALS_TIME = 5000;
  private socketIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private readonly logger: LoggingService) {}

  handleConnection(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Mở kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Đóng kết nối: ${client.id}`);

    // Dọn dẹp interval khi client disconnect bất ngờ ( mất internet,... )
    this.cleanupUserInterval(client);
  }

  // tham gia nhóm
  @SubscribeMessage('joinUserHomesRoom')
  joinUserHomesRoom(@MessageBody() data: JoinUserHomesRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCodes } = data;
    if (!userCode) return;

    client.data.userCode = userCode;
    const room = `user-${userCode}-room`;
    client.join(room);

    this.logger.log(this.SERVICE_NAME, `${client.id} đã vào phòng: ${room}`);

    // Khởi tạo interval nếu chưa có
    if (!this.socketIntervals.has(userCode)) {
      this.startSensorDataInterval(userCode, userHomeCodes, room);
    }

    // Gửi dữ liệu rỗng lần đầu
    this.sendInitialData(client, userHomeCodes, userCode);
  }

  // gửi sensor data cho client
  private sendSensorData(room: string, payload: UserHomeSensorDataDto) {
    this.logger.log(this.SERVICE_NAME, `streamUserHomesSensorData: ${JSON.stringify(payload)}`);
    this.server.to(room).emit('streamUserHomesSensorData', payload);
  }

  // rời phòng -> xóa interval
  @SubscribeMessage('leaveUserHomesRoom')
  leaveUserHomesRoom(@MessageBody() data: LeaveUserHomesRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode } = data;
    if (!userCode) return;
    
    const room = `user-${userCode}-room`;
    client.leave(room);
    this.cleanupUserInterval(client);
    this.logger.log(this.SERVICE_NAME, `${client.id} đã rời phòng: ${room}`);
  }

  // khởi tạo internal khi chưa có
  private startSensorDataInterval(userCode: string, userHomeCodes: string[], room: string) {
    const interval = setInterval(() => {
      const sensorData = this.generateMockSensorData(userHomeCodes);
      this.sendSensorData(room, { userCode, data: sensorData });
    }, this.INTERVALS_TIME);

    this.socketIntervals.set(userCode, interval);
    this.logger.log(this.SERVICE_NAME, `Đã khởi tạo interval cho userCode: ${userCode}`);
  }

  // lấy dữ liệu fake
  private generateMockSensorData(userHomeCodes: string[]): SensorData[] {
    return userHomeCodes.map((homeCode) => ({
      userHomeCode: homeCode,
      temperature: Math.floor(Math.random() * 8) + 24,
      humidity: Math.floor(Math.random() * 15) + 55,
      current: Number((Math.random() * 4 + 1).toFixed(2)),
    }));
  }

  // gửi mảng rỗng khi khởi tạo
  private sendInitialData(client: Socket, userHomeCodes: string[], userCode: string) {
    client.emit('streamUserHomesSensorData', {
      userCode,
      data: userHomeCodes.map((homeCode) => ({
        userHomeCode: homeCode,
        temperature: 0,
        humidity: 0,
        current: 0,
      })),
    });
  }

  // xóa interval
  private cleanupUserInterval(client: Socket) {
    const userCode = client.data?.userCode as string;
    if (!userCode) return;

    const room = `user-${userCode}-room`;
    const roomClients = this.server.sockets.adapter?.rooms?.get(room);

    if (!roomClients || roomClients.size === 0) {
      const interval = this.socketIntervals.get(userCode);
      if (interval) {
        clearInterval(interval);
        this.socketIntervals.delete(userCode);
        this.logger.log(this.SERVICE_NAME, `Đã xóa interval của userCode: ${userCode}`);
      }
    }
  }
}
