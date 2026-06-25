import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { APP_SCREENS } from 'src/helpers/const.helper';

export class GetAdsBannerDto {
  @ApiProperty({ example: APP_SCREENS.QR_SCREEN, enum: Object.values(APP_SCREENS) })
  @IsNotEmpty()
  @IsString()
  @IsEnum(Object.values(APP_SCREENS))
  targetScreen: string;
}
