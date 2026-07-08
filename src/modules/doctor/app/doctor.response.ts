import { ApiProperty } from '@nestjs/swagger';
import { YnEnum } from 'src/interfaces/admin.interface';
import { DoctorStatusEnum } from '../common/doctor.enum';

export class UploadFileDoctorResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;
}
export class DoctorAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userPhone: string;

  @ApiProperty({ example: '' })
  note: string;

  @ApiProperty({ example: '' })
  noteAnswered: string;

  @ApiProperty({ example: '' })
  status: DoctorStatusEnum;

  @ApiProperty({ example: '' })
  uniqueId: string;

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

  @ApiProperty({ example: '' })
  doctorFiles: DoctorFileAppResDto[];
}
export class DoctorFileStrAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;
}
export class DoctorFileAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: 0 })
  doctorSeq: number;

  @ApiProperty({ example: '' })
  userCode: string;

  @ApiProperty({ example: '' })
  homeName: string;

  @ApiProperty({ example: '' })
  filename: string;

  @ApiProperty({ example: '' })
  originalname: string;

  @ApiProperty({ example: 0 })
  size: number;

  @ApiProperty({ example: '' })
  mimetype: string;

  @ApiProperty({ example: '' })
  uniqueId: string;

  @ApiProperty({ example: YnEnum.N })
  isActive: YnEnum;
}
export class DoctorVideoAppResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  name: string;

  @ApiProperty({ example: '' })
  address: string;

  @ApiProperty({ example: '' })
  videoTitle: string;

  @ApiProperty({ example: '' })
  videoUrl: string;

  @ApiProperty({ example: 0 })
  sortOrder: number;

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
