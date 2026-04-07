import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export class GetAllGuestConsulationDto extends PagingDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  keyword: string;
}
