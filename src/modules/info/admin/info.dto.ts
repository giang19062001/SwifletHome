import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateInfoDto {
  // @IsString()
  // @IsNotEmpty()
  // infoName: string;

  // @IsString()
  // @IsNotEmpty()
  // infoDescription: string;

  //  @ApiProperty({
  //     example: { key: 'value' },
  //   })

  @IsNotEmpty()
  infoContent: string; // luôn là string vì gửi bằng FormData (JSON.stringfy())

  @IsString()
  @IsNotEmpty()
  updatedId: string;
}
