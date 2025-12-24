import { ApiProperty } from "@nestjs/swagger";

export class UploadFileDoctorResDto {
   @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;
}