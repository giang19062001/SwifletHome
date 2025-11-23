import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LoggingService } from '../logger/logger.service';

interface SensorData {
  userHomeCode: string;
  temperature: number;
  humidity: number;
  current: number;
}

// khai báo 1 gateway
@WebSocketGateway({
  namespace: 'socket/userHomes', // ->  SOCKET_URL = 'http://<server-domain>/socket/userHomes';
  transports: ['websocket'], // polling || websocket
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() // inject class socket cho biến server
  server: Server;

  private readonly SERVICE_NAME = 'SocketGateway/UserHomes';
  private readonly INTERVALS_TIME = 3000; // mỗi 3 giây

  constructor(private readonly logger: LoggingService) {}

  handleConnection(client: Socket, ...args: Socket[]) {
    this.logger.log(this.SERVICE_NAME, `Kết nối:', ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(this.SERVICE_NAME, `Đóng kết nối: ${client.id}`);

    const userCode = client.data.userCode;

    if (!userCode) return; // Không có userCode thì không cần xử lý

    const room = `user_${userCode}`;

    // Kiểm tra xem còn client nào trong room không
    const clientsInRoom = this.server.sockets.adapter && this.server.sockets.adapter.rooms.get(room);

    if (!clientsInRoom || clientsInRoom.size === 0) {
      // Không còn client nào → xóa interval
      const interval = this.socketIntervals.get(userCode);
      if (interval) {
        clearInterval(interval);
        this.socketIntervals.delete(userCode);
        this.logger.log(this.SERVICE_NAME, `Xóa interval của userCode: ${userCode}`);
      }
    }
  }

  // Lưu interval theo userCode
  private socketIntervals = new Map<string, NodeJS.Timeout>(); // OBJECT SOCKET

  @SubscribeMessage('joinUserHomesRoom')
  joinUserHomesRoom(@MessageBody() { userCode }: { userCode: string }, @ConnectedSocket() client: Socket) {
    if (userCode) {
      //Lưu userCode vào socket
      client.data.userCode = userCode;

      // tạo phòng và tham gia
      const room = `user_${userCode}`;
      client.join(room);

      this.logger.log(this.SERVICE_NAME, `${client.id} đã tham gia phòng: ${room}`);
      // this.logger.log(this.SERVICE_NAME, `Số lượng interval:', ${this.socketIntervals.size}`);

      // kiểm tra nếu chưa có dữ liệu userCode trong Mao thì thêm vào
      if (!this.socketIntervals.has(userCode)) {
        const interval = setInterval(() => {
          // ! danh sách nhà yến của user này phải lấy từ DB
          const homesOfUser = ['HOM000001', 'HOM000002', 'HOM000003', 'HOM000004'];
          // ! dữ liệu sẽ gửi humidity, current, temperature cho từng home của user này (phải lấy từ sensor thật)
          const sensorData: SensorData[] = homesOfUser.map((userHomeCode) => ({
            userHomeCode: userHomeCode,
            temperature: Math.floor(Math.random() * 8) + 24,
            humidity: Math.floor(Math.random() * 15) + 55,
            current: Number((Math.random() * 4 + 1).toFixed(2)),
          }));

          // Gửi data tất cả nhà yến home của user này theo userCode
          console.log('sensorData ===> ', JSON.stringify(sensorData));
          this.server.to(room).emit('userhome-sensor-data', {
            userCode,
            data: sensorData,
          });
        }, this.INTERVALS_TIME);
        this.socketIntervals.set(userCode, interval);
      }

      // Gửi ngay lần đầu -> rỗng
      client.emit('userhome-sensor-data', {
        userCode,
        data: [],
      });
    }
  }
}
