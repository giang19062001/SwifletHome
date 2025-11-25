import { IsString, IsArray, IsNumber, ValidateNested, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { SensorDataDto } from '../socket.dto';

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

}
export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  userHomeCodes: string[];
}
