import { IsString, IsArray, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
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

export class JoinUserHomesRoomDto {
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @IsString()
  @IsNotEmpty()
  userHomeCodes: string; // string array
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
