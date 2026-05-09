import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerReplyDto {
  @ApiProperty({
    example: 'Thử chim như thế nào?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class AnswerReplyDtoV2 {
  @ApiProperty({
    example: 'Thử chim như thế nào?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    example: [{ user: 'Chào bot', assistant: 'ANS000001' }],
    required: false,
  })
  currentChatHistories: { user: string; assistant: string }[];
}

