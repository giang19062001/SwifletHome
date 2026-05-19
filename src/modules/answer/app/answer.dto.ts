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
