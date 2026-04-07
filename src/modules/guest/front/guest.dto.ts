import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreateGuestConsulationDto {
  @ApiProperty({ example: 'Giang' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0123456789' })
  @IsNumberString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Khám bệnh nhà yến' })
  @IsString()
  @IsNotEmpty()
  issueInterest: string;

  @ApiProperty({ example: 'Nhà yến của tôi bị chim lạ vào làm tổ' })
  @IsString()
  @IsNotEmpty()
  issueDescription: string;
}
