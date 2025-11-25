import { IsString, IsArray, IsNumber, ValidateNested, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class SensorDataDto {
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  current: number;
}

export class LeaveUserHomesRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

}
export class JoinUserHomesRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  userHomeCodes: string[];
}

export class UserHomeSensorDataDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SensorDataDto)
  data: SensorDataDto[];
}
