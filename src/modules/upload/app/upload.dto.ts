import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export enum MediaTypeEnum {
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export class GetAllMediaDto extends PagingDto {
  @ApiProperty({
    example: 'AUDIO',
    enum: MediaTypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(MediaTypeEnum)
  mediaType: MediaTypeEnum;
}
