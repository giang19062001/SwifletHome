import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShareTypeEnum } from './share.interface';
import { HarvestDataInputDto } from 'src/modules/todo/app/todo.dto';

export class GetShareLinkResDto {
  @ApiProperty()
  link: string;
}

class ShareDataHarvestDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiPropertyOptional({ type: () => [HarvestDataInputDto] })
  harvestData?: HarvestDataInputDto[];
}

export class GetShareDataResDto {
  @ApiProperty({ example: ShareTypeEnum.HARVEST, enum: ShareTypeEnum })
  shareType: ShareTypeEnum;

  @ApiPropertyOptional({ type: () => ShareDataHarvestDto })
  shareData?: ShareDataHarvestDto;
}
