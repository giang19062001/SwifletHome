import { ApiProperty } from "@nestjs/swagger";

export class UploadFileDoctorResDto {
  @ApiProperty({ example: '' })
  filename: string;
}