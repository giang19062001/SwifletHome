import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { PackageOptionTypeEnum } from '../common/package.enum';

export class PackageResDto {
  @ApiProperty()
  seq: number;

  @ApiProperty()
  packageCode: string;

  @ApiProperty()
  packageName: string;

  @ApiProperty()
  packagePrice: string;

  @ApiProperty()
  packageExpireDay: number;

  @ApiProperty()
  packageDescription: string;
}
export class PackageAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  packageCode: string;

  @ApiProperty({ example: '' })
  packageName: string;

  @ApiProperty({ example: '' })
  packageDescription: string;

  @ApiProperty({ example: '' })
  packagePrice: string;

  @ApiProperty({ example: '' })
  packageItemSamePrice: string;

  @ApiProperty({ example: 0 })
  packageExpireDay: number;

  @ApiProperty({ example: '' })
  packageOptionType: PackageOptionTypeEnum;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: '' })
  createdId: string;

  @ApiProperty({ example: '' })
  updatedId: string;
}
