import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { InfoBankResDto } from '../info/info.response';

export class ScreenResDto {
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

export class RequestDoctorVideoYoutubeDto {
  @ApiProperty({ example: '' })
  videoTitle: string;
  @ApiProperty({ example: '' })
  videoUrl: string;
}

export class RequestDoctorVideoGroupDto {
  @ApiProperty({ example: '' })
  name: string;
  @ApiProperty({ example: '' })
  address: string;
  @ApiProperty({ type: [RequestDoctorVideoYoutubeDto] })
  listVideoYoutobe: RequestDoctorVideoYoutubeDto[];
}

export class RequestDoctorContentCenterDto {
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
  @ApiProperty({ type: [RequestDoctorVideoGroupDto] })
  listVideo: RequestDoctorVideoGroupDto[];
}

export class ScreenRequestDoctorResDto {
  @ApiProperty({ example: '' })
  contentEnd: string;
  @ApiProperty({ example: '' })
  contentStart: string;
  @ApiProperty({ type: RequestDoctorContentCenterDto })
  contentCenter: RequestDoctorContentCenterDto;
}

export class ScreenCommonGuideResDto {
  @ApiProperty({ example: '' })
  contentEnd: string;
  @ApiProperty({ example: '' })
  contentStart: string;
  @ApiProperty({ example: '' })
  contentCenter: { symptom: string };
}

export class ScreenSignupServiceResDto {
  @ApiProperty({ example: '' })
  contentEnd: string;
  @ApiProperty({ example: '' })
  contentStart: string;
  @ApiProperty({ example: '' })
  contentCenter: { packages: string[]; bankInfo: InfoBankResDto | null };
}

export class ScreenVideoResDto {
  seq: number;
  name: string;
  address: string;
  videoTitle: string;
  videoUrl: string;
  sortOrder: number;
  isActive: string;
  createdAt: Date;
}
