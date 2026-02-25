import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';

export class GetInfoResDto {
  @ApiProperty()
  seq: string;

  @ApiProperty()
  infoKeyword: string;

  @ApiProperty()
  infoName: string;
  
  @ApiProperty()
  infoContent: Record<string, any>;

  @ApiProperty()
  infoDescription: string;

  @ApiProperty()
  isActive: YnEnum;
}
