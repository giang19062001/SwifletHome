import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export class GetAllAnswerResDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  answerCategory: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  answerObject: string;
}
