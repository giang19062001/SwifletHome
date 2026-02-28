import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetAllTeamDto extends PagingDto{
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  provinceCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsOptional()
  txtSearch: string;
}
