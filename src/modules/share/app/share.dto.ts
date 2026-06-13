import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class GetShareLinkDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  seq: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  harvestPhase: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  harvestYear: number;
}
