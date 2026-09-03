import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export class GetHomesAdminDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsOptional()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  userPhone: string;

  @ApiProperty({
    example: '',
  })
  @IsOptional()
  provinceCode: string;
}

export class TriggerUserHomeSensorDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: '',
    description: 'Mã máy / Mã cảm biến',
  })
  @IsString()
  @IsNotEmpty()
  machineCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  wifiId?: string;

  @ApiProperty({
    example: '',
    required: false,
  })
  @IsString()
  @IsOptional()
  wifiPassword?: string;
}
