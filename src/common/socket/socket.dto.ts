import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SensorDataDto {
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