import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateConsignmentDto {
  @ApiProperty({ example: 'DELIVERING' })
  @IsEnum(['WAITING', 'CONFIRMED', 'DELIVERING', 'CANCEL', 'DELIVERED', 'RETURN'])
  consignmentStatus: string;

  @ApiProperty({ example: 'Đang giao hàng tới trạm trung chuyển' })
  @IsString()
  @IsNotEmpty()
  noticeContent: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  userCode: string;
  
  @ApiProperty({ example: ['Hà Nội', 'Hải Phòng'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  deliveringAddressList?: string[];
}
