import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

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

  // @ApiProperty({
  //   example: '',
  // })
  // @IsString()
  // @IsNotEmpty()
  // userHomeCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  macId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  wifiId: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  wifiPassword: string;
}
