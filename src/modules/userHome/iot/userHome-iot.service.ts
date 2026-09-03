import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { MqttService } from 'src/common/mqtt/mqtt.service';
import { ControlSensorCommandDto } from './userHome-iot.dto';
import { UserHomeIotRepository } from './userHome-iot.repository';

@Injectable()
export class UserHomeIotService {
  private readonly SERVICE_NAME = 'UserHomeIotService';

  constructor(
    private readonly userHomeIotRepository: UserHomeIotRepository,
    private readonly logger: LoggingService,
    private readonly mqttService: MqttService,
  ) {}

  async getSensorConfigByMachineCode(machineCode: string) {
    const logbase = `${this.SERVICE_NAME}/getSensorConfigByMachineCode:`;
    console.log(this.SERVICE_NAME, `==> [SENSOR_CONFIG] Lấy cấu hình cảm biến cho mã máy: ${machineCode}`);
    this.logger.log(logbase, `Lấy cấu hình cảm biến cho mã máy: ${machineCode}`);
    try {
      const config = await this.userHomeIotRepository.getSensorConfigByMachineCode(machineCode);
      if (!config) {
        throw new BadRequestException('Không tìm thấy cấu hình cảm biến cho mã máy này');
      }
      return config;
    } catch (error) {
      this.logger.error(logbase, error);
      throw error;
    }
  }

  async sendSensorCommand(userHomeCode: string, dto: ControlSensorCommandDto) {
    const logbase = `${this.SERVICE_NAME}/sendSensorCommand:`;
    try {
      const sensor = await this.userHomeIotRepository.getSensorByHomeCode(userHomeCode);
      if (!sensor || !sensor.macId) {
        throw new BadRequestException('Nhà yến này chưa có cảm biến/thiết bị được kích hoạt');
      }

      // Tạo payload chỉ gồm các trường được truyền lên
      const payload: Record<string, number> = {};
      if (dto.light !== undefined) payload.light = dto.light;
      if (dto.fan !== undefined) payload.fan = dto.fan;
      if (dto.pump !== undefined) payload.pump = dto.pump;

      if (Object.keys(payload).length === 0) {
        throw new BadRequestException('Vui lòng truyền ít nhất 1 trạng thái thiết bị để điều khiển (light, fan, pump)');
      }

      await this.mqttService.publishCommand(sensor.macId, payload);
      this.logger.log(logbase, `Đã gửi lệnh điều khiển tới nhà yến ${userHomeCode} (macId: ${sensor.macId}): ${JSON.stringify(payload)}`);
      return payload;
    } catch (error) {
      this.logger.error(logbase, error);
      throw error;
    }
  }
}
