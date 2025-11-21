import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerReplyDto {
  @ApiProperty({
    example: 'Âm thanh dẫn dụ chim yến ?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}
