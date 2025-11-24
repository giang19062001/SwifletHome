import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateScreenDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  screenName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  screenDescription: string;

 @ApiProperty({
    example: { key: 'value' },
  })
  @IsObject() // kiểm tra là object
  @IsNotEmptyObject() // không rỗng
  screenContent: any;

}
