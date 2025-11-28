import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetHomesAdminDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;
}

export class TriggerHomeDto {
  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isTriggered: YnEnum;
}
