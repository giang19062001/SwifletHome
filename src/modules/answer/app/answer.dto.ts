import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerReplyDto {
  @ApiProperty({
    example: 'Chim yến bay đi không chịu ở hay ngủ lại nhà yến ?',
  })
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class AnswerReplyDtoV2 {
  @ApiProperty({
    example: 'Chim yến bay đi không chịu ở hay ngủ lại nhà yến ?',
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

