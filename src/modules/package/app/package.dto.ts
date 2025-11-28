import { ApiProperty } from "@nestjs/swagger";

export class ResPackageDto {
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
