import { ApiProperty } from "@nestjs/swagger";
import { ResInfoBankDto } from "src/modules/info/app/info.dto";
import { ResPackageDto } from "src/modules/package/app/package.dto";

// export class ContentCenterDto {
//   @ApiProperty({ type: [ResPackageDto] })
//   packages: ResPackageDto[];

//   @ApiProperty()
//   bankInfo: ResInfoBankDto;
// }

export class ResScreenDto {
  @ApiProperty()
  contentStart: string;

  @ApiProperty()
  contentCenter: any;

  @ApiProperty()
  contentEnd: string;
}