import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

export class ResUserAppDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userPhone: string;

  @ApiProperty({ example: '' })
  deviceToken: string;

  @ApiProperty({ example: 'Y', enum: ['Y', 'N'] })
  isActive: YnEnum;
}

export class ResUserAuthAppDto extends ResUserAppDto {
  @ApiProperty({ example: '' })
  accessToken: string;
}

export class ResUserAppInfoDto extends ResUserAppDto {
  @ApiProperty({ example: '' })
  startDate: Date | null;

  @ApiProperty({ example: '' })
  endDate: Date | null;

  @ApiProperty({ example: '' })
  packageCode: Date | null;

  @ApiProperty({ example: '' })
  packageName: string;

  @ApiProperty({ example: '' })
  packageDescription: string;
}

export class CreateUserPaymentAppDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null) // bỏ qua validate khi value string === null
  @IsString()
  packageCode: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  endDate: string | null;
}
