import { MqttService } from './../../mqtt/mqtt.service';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ISensor, ISensorHome } from '../socket.interface';
import { LoggingService } from '../../logger/logger.service';
import { JoinRoomDto, LeaveRoomDto } from './homeOfUser.dto';
import { OnEvent } from '@nestjs/event-emitter';

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

  constructor(
    private readonly mqttService: MqttService,
    private readonly logger: LoggingService,
  ) {}

  afterInit() {
    this.logger.log(this.SERVICE_NAME, 'Gateway đã thiết lập');
  }

  handleConnection(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Mở kết nối: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Đóng kết nối: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(@MessageBody() data: JoinRoomDto, @ConnectedSocket() client: Socket) {
    const { userCode, userHomeCode } = data;
    if (!userCode || !userHomeCode) return;

    const room = `HOME-${userCode}-${userHomeCode}-ROOM`;
    client.join(room);

    this.watchingHome.set(userCode, userHomeCode);

    this.logger.log(this.SERVICE_NAME, `${client.id} đã vào phòng: ${room}`);

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

    this.logger.log(this.SERVICE_NAME, `${client.id} đã rời phòng: ${room}`);
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
      this.logger.log(this.SERVICE_NAME, `Thiết bị offline  ${key}`);
    }
  }
}