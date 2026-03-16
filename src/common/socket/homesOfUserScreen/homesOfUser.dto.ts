import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

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
