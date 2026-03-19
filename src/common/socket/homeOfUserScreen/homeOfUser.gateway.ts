import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggingService } from '../../logger/logger.service';
import { ISensor } from '../socket.interface';
import { MqttService } from './../../mqtt/mqtt.service';
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
  
  // Theo dõi home mà user đang xem
  private watchingHome = new Map<string, string>(); // key: userCode, value: userHomeCode
  // Theo dõi client rớt mạng để tránh memory leak
  private clientUserMap = new Map<string, string>(); // key: client.id, value: userCode

  constructor(
    private readonly mqttService: MqttService,
    private readonly logger: LoggingService,
  ) {}

  afterInit() {
    console.log(this.SERVICE_NAME, 'Gateway đã thiết lập');
  }

  handleConnection(client: Socket) {
    console.log(this.SERVICE_NAME, `Mở kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(this.SERVICE_NAME, `Đóng kết nối: ${client.id}`);
    
    // Tìm userCode và xóa khỏi Map để tránh memory leak
    const userCode = this.clientUserMap.get(client.id);
    if (userCode) {
      this.watchingHome.delete(userCode);
      this.clientUserMap.delete(client.id);
      console.log(this.SERVICE_NAME, `Đã thu hồi memory leak cho userCode: ${userCode}`);
    }
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCode } = data;
    if (!userCode || !userHomeCode) return;

    const room = `HOME-${userCode}-${userHomeCode}-ROOM`;
    client.join(room);

    this.watchingHome.set(userCode, userHomeCode);
    this.clientUserMap.set(client.id, userCode); // Liên kết client.id với userCode

    console.log(this.SERVICE_NAME, `${client.id} đã vào phòng: ${room}`);

    // Gửi dữ liệu khởi tạo ( là 0 )
    this.sendInitialData(client);
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(@MessageBody() data: LeaveRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCode } = data;
    if (!userCode || !userHomeCode) return;

    const room = `HOME-${userCode}-${userHomeCode}-ROOM`;
    client.leave(room);

    this.watchingHome.delete(userCode);
    this.clientUserMap.delete(client.id); // Dọn dẹp memory leak

    console.log(this.SERVICE_NAME, `${client.id} đã rời phòng: ${room}`);
  }

  private sendSensorData(room: string, payload: ISensor) {
    console.log(this.SERVICE_NAME, `streamSensorData: ${room} - ${JSON.stringify(payload)}`);
    this.server.to(room).emit('streamSensorData', payload);
  }

  private sendInitialData(client: Socket) {
    client.emit('streamSensorData', {
      temperature: 0,
      humidity: 0,
      current: 0,
    });
  }

  // Nhận dữ liệu cảm biến realtime từ MQTT
  @OnEvent('sensor.data.updated')
  handleSensorDataUpdated(payload: { key: string; data: ISensor }) {
    const { key, data } = payload;

    const parts = key.split('-');
    if (parts.length !== 3 || parts[0] !== 'MAC') return;

    const userCode = parts[1];
    const homeCode = parts[2];

    const homeCodeWatching = this.watchingHome.get(userCode);
    if (!homeCodeWatching || homeCodeWatching !== homeCode) {
      return;
    }

    const sensorHome: ISensor = {
      temperature: data.temperature,
      humidity: data.humidity,
      current: data.current,
    };

    const room = `HOME-${userCode}-${homeCode}-ROOM`;
    this.sendSensorData(room, sensorHome);
  }

  //  Xử lý khi thiết bị offline 
  @OnEvent('sensor.status.changed')
  handleSensorStatusChanged(payload: { key: string; status: 'online' | 'offline' }) {
    const { key, status } = payload;

    const parts = key.split('-');
    if (parts.length !== 3 || parts[0] !== 'MAC') return;

    const userCode = parts[1];
    const homeCode = parts[2];

    const homeCodeWatching = this.watchingHome.get(userCode);
    if (!homeCodeWatching || homeCodeWatching !== homeCode) return;

    const room = `HOME-${userCode}-${homeCode}-ROOM`;

    if (status === 'offline') {
      const offlineData: ISensor = {
        temperature: 0,
        humidity: 0,
        current: 0,
      };

      this.sendSensorData(room, offlineData);
      console.log(this.SERVICE_NAME, `Thiết bị offline  ${key}`);
    }
  }
}