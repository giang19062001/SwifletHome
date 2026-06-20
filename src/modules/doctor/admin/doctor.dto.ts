import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  noteAnswered: string;

}

export class DoctorVideoDto {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  videoTitle: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ example: 0, required: false })
  sortOrder?: number;
}

export class VideoSortOrderDto {
  @ApiProperty({ example: 1 })
  seq: number;
  @ApiProperty({ example: 0 })
  sortOrder: number;
}

export class UpdateVideoSortOrderDto {
  @ApiProperty({ type: [VideoSortOrderDto] })
  items: VideoSortOrderDto[];
}
