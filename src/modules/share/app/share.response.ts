import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { HarvestDataInputDto } from 'src/modules/todo/app/todo.dto';
import { UserHomeResDto } from '../../userHome/app/userHome.response';
import { ShareTypeEnum } from './share.enum';

export class SharedHomeDataResDto extends OmitType(UserHomeResDto, ['isIntegateTempHum', 'isIntegateCurrent', 'isTriggered', 'uniqueId'] as const) {}

export class GetShareLinkResDto {
  @ApiProperty()
  link: string;
}

class ShareDataHarvestDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: 0 })
  harvestPhase: number;

  @ApiProperty({ example: 0 })
  harvestYear: number;

  @ApiProperty({ type: () => SharedHomeDataResDto })
  homeData: SharedHomeDataResDto;

  @ApiPropertyOptional({ type: () => [HarvestDataInputDto] })
  harvestData?: HarvestDataInputDto[];
}

export class GetShareDataResDto {
  @ApiProperty({ example: ShareTypeEnum.HARVEST, enum: ShareTypeEnum })
  shareType: ShareTypeEnum;

  @ApiPropertyOptional({ type: () => ShareDataHarvestDto })
  shareData?: ShareDataHarvestDto;
}
export class ShareItemAppResDto {
  seq: number;
  shareToken: string;
  seqShare: number;
  shareType: string;
  isActive: string;
}
export class HarvestPhaseItemAppResDto {
  seq: number;
  userHomeCode: string;
  harvestPhase: number;
  harvestYear: number;
}
