import { IsString, IsArray, IsNumber, ValidateNested, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { SensorDataDto } from '../socket.dto';

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsString()
  @IsNotEmpty()
  userHomeCode: string;
}
export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsString()
  @IsNotEmpty()
  userHomeCode: string;
}

export class StreamDataDto {
  @IsNumber()
  humidity: number;
}
