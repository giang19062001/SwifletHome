import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ISensor, ISensorHome } from '../socket.interface';
import { LoggingService } from '../../logger/logger.service';
import { JoinRoomDto, LeaveRoomDto } from './homesOfUser.dto';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  namespace: 'socket/homesOfUser',
  transports: ['websocket'],
  cors: { origin: '*' },
})
export class HomesOfUserGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly SERVICE_NAME = 'SocketGateway/homesOfUser';

  // Theo dõi homes mà user đang xem
  private watchingHomes = new Map<string, Set<string>>(); // userCode → Set<homeCode>

  // Cache dữ liệu mới nhất 
  private latestSensorDataOfHomes = new Map<string, ISensorHome>(); // key: MAC-userCode-homeCode

  // Trạng thái online/offline 
  private sensorOnline = new Map<string, boolean>(); // key: MAC-userCode-homeCode → true/false

  constructor(private readonly logger: LoggingService) {}

  afterInit() {
    this.logger.log(this.SERVICE_NAME, 'Gateway multiple homes đã khởi động');
  }

  handleConnection(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCodes } = data;

    if (!userCode || !Array.isArray(userHomeCodes) || userHomeCodes.length === 0) {
      return;
    }

    const room = `USER-${userCode}-ROOM`;
    client.join(room);
    this.watchingHomes.set(userCode, new Set(userHomeCodes));

    // Khởi tạo trạng thái offline cho tất cả homes khi mới join
    userHomeCodes.forEach((homeCode) => {
      const key = `MAC-${userCode}-${homeCode}`;
      this.sensorOnline.set(key, false); // mặc định offline khi chưa có dữ liệu
    });

    this.logger.log(this.SERVICE_NAME, `User ${userCode} theo dõi ${userHomeCodes.length} homes`);

    // Gửi dữ liệu ban đầu: tất cả là 0
    const initialSnapshot = userHomeCodes.map((homeCode) => ({
      userHomeCode: homeCode,
      temperature: 0,
      humidity: 0,
      current: 0,
    }));

    client.emit('streamSensorData', initialSnapshot);
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() data: LeaveRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode } = data;
    if (!userCode) return;

    const room = `USER-${userCode}-ROOM`;
    client.leave(room);

    // Dọn dẹp homes mà user đang xem
    const homes = this.watchingHomes.get(userCode);
    if (homes) {
      homes.forEach((homeCode) => {
        const key = `MAC-${userCode}-${homeCode}`;
        this.latestSensorDataOfHomes.delete(key);
        this.sensorOnline.delete(key);
      });
    }
    this.watchingHomes.delete(userCode);

    this.logger.log(this.SERVICE_NAME, `User ${userCode} đã rời phòng`);
  }

  // Xây dựng dữ liệu của toàn bộ sensor của từng home của user đó
  private buildFullSnapshot(userCode: string): ISensorHome[] {
    const homes = this.watchingHomes.get(userCode);
    if (!homes) return [];

    return Array.from(homes).map((homeCode) => {
      const key = `MAC-${userCode}-${homeCode}`;
      const isOnline = this.sensorOnline.get(key) ?? false;

      if (isOnline) {
        // Có dữ liệu thật → dùng cache 
        return this.latestSensorDataOfHomes.get(key)!;
      } else {
        // Offline hoặc chưa có dữ liệu → trả về 0
        return {
          userHomeCode: homeCode,
          temperature: 0,
          humidity: 0,
          current: 0,
        };
      }
    });
  }

  // Gửi toàn bộ dữ liệu sensor của mỗi home cho user
  private sendFullSnapshot(userCode: string) {
    const snapshot = this.buildFullSnapshot(userCode);
    const room = `USER-${userCode}-ROOM`;

    console.log(
      this.SERVICE_NAME,
      `toàn bộ dữ liệu sensor của homes cho user ${userCode}: ${snapshot.length} homes`,
      snapshot.map(s => `${s.userHomeCode}: ${s.temperature}°C, ${s.humidity}%, ${s.current}mA`).join(' | '),
    );

    this.server.to(room).emit('streamSensorData', snapshot);
  }

  // Khi nhận dữ liệu từ sensor
  @OnEvent('sensor.data.updated')
  handleSensorDataUpdated(payload: { key: string; data: ISensor }) {
    const { key, data } = payload;

    const parts = key.split('-');
    if (parts.length !== 3 || parts[0] !== 'MAC') return;

    const userCode = parts[1];
    const homeCode = parts[2];

    const watchedHomes = this.watchingHomes.get(userCode);
    if (!watchedHomes || !watchedHomes.has(homeCode)) return;

    const cacheKey = `MAC-${userCode}-${homeCode}`;

    // Cập nhật cache dữ liệu 
    const homeData: ISensorHome = {
      userHomeCode: homeCode,
      temperature: data.temperature,
      humidity: data.humidity,
      current: data.current,
    };
    this.latestSensorDataOfHomes.set(cacheKey, homeData);

    // Đánh dấu là online
    this.sensorOnline.set(cacheKey, true);

    // Gửi toàn bộ dữ liệu sensor
    this.sendFullSnapshot(userCode);
  }

  // Khi sensor offline
  @OnEvent('sensor.status.changed')
  handleSensorStatusChanged(payload: { key: string; status: 'online' | 'offline' }) {
    const { key, status } = payload;

    const parts = key.split('-');
    if (parts.length !== 3 || parts[0] !== 'MAC') return;

    const userCode = parts[1];
    const homeCode = parts[2];

    const watchedHomes = this.watchingHomes.get(userCode);
    if (!watchedHomes || !watchedHomes.has(homeCode)) return;

    const cacheKey = `MAC-${userCode}-${homeCode}`;

    if (status === 'offline') {
      // Đánh dấu offline  → gí trị sẽ trả về 0
      this.sensorOnline.set(cacheKey, false);

      this.logger.log(this.SERVICE_NAME, `Home ${homeCode} offline → gửi dữ liệu với giá trị về 0`);

      this.sendFullSnapshot(userCode);
    }
    // Nếu online → chờ dữ liệu từ data.updated
  }
}