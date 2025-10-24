import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/common/interface/dto';

export class GetAllAnswerDto extends PagingDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  categoryAnsCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  answerObject: string;
}

export class AnswerDetailDto {
  @ApiProperty({
    example: 'ANS000001',
  })
  @IsString()
  @IsNotEmpty()
  answerCode: string;
}

export class UpdateAnswerDto {
  @ApiProperty({ example: 'ANS000001' })
  @IsNotEmpty()
  @IsString()
  answerCode: string;

  @ApiProperty({ example: '<p>Hello word</p>' })
  @IsNotEmpty()
  @IsString()
  answerContent: string;

  @ApiProperty({ example: '<p>Hello word</p>' })
  @IsNotEmpty()
  @IsString()
  answerContentRaw: string;
}
