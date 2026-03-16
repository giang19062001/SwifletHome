import { IsNotEmpty, IsString } from 'class-validator';

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
