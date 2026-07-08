import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { InfoBankAppResDto } from '../../info/app/info.response';

export class GetContentScreenResDto {
  @ApiProperty()
  contentStart: string;

  @ApiProperty()
  contentCenter: any;

  @ApiProperty()
  contentEnd: string;
}
export class ScreenAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  screenKeyword: string;

  @ApiProperty({ example: '' })
  screenName: string;

  @ApiProperty({ example: '' })
  screenDescription: string;

  @ApiProperty({ example: '' })
  contentStart: string;

  @ApiProperty({ example: {} })
  contentCenter: any;

  @ApiProperty({ example: '' })
  contentEnd: string;

  @ApiProperty({ example: '' })
  screenTeamplateKeyword: string;

  @ApiProperty({ example: {} })
  screenSupportContent: any;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;

  @ApiProperty({ example: new Date() })
  createdAt: Date;

  @ApiProperty({ example: new Date() })
  updatedAt: Date;

  @ApiProperty({ example: '' })
  createdId!: string;

  @ApiProperty({ example: '' })
  updatedId!: string;
}
export class RequestDoctorVideoYoutubeDtoApp {
  @ApiProperty({ example: '' })
  videoTitle: string;

  @ApiProperty({ example: '' })
  videoUrl: string;
}
export class RequestDoctorVideoGroupDtoApp {
  @ApiProperty({ example: '' })
  name: string;

  @ApiProperty({ example: '' })
  address: string;

  @ApiProperty({ type: [RequestDoctorVideoYoutubeDtoApp] })
  listVideoYoutobe: RequestDoctorVideoYoutubeDtoApp[];
}
export class RequestDoctorContentCenterDtoApp {
  @ApiProperty({ example: '' })
  title: string;

  @ApiProperty({ example: '' })
  banner: string;

  @ApiProperty({ example: '' })
  instruction: string;

  @ApiProperty({ example: '' })
  process: string;

  @ApiProperty({ example: '' })
  price: string;

  @ApiProperty({ type: [RequestDoctorVideoGroupDtoApp] })
  listVideo: RequestDoctorVideoGroupDtoApp[];
}
export class ScreenRequestDoctorAppResDto {
  @ApiProperty({ example: '' })
  contentEnd: string;

  @ApiProperty({ example: '' })
  contentStart: string;

  @ApiProperty({ type: RequestDoctorContentCenterDtoApp })
  contentCenter: RequestDoctorContentCenterDtoApp;
}
export class ScreenCommonGuideAppResDto {
  @ApiProperty({ example: '' })
  contentEnd: string;

  @ApiProperty({ example: '' })
  contentStart: string;

  @ApiProperty({ example: '' })
  contentCenter: { symptom: string };
}
export class ScreenSignupServiceAppResDto {
  @ApiProperty({ example: '' })
  contentEnd: string;

  @ApiProperty({ example: '' })
  contentStart: string;

  @ApiProperty({ example: '' })
  contentCenter: { packages: string[]; bankInfo: InfoBankAppResDto | null };
}
export class ScreenVideoAppResDto {
  seq: number;
  name: string;
  address: string;
  videoTitle: string;
  videoUrl: string;
  sortOrder: number;
  isActive: string;
  createdAt: Date;
}
