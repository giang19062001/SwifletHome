import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

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

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  contentStart?: string;

  @ApiPropertyOptional({ example: {} })
  @IsObject()
  @IsOptional()
  contentCenter?: any;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  contentEnd?: string;
}
