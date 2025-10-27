import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/common/interface/dto';

export class GetAllAnswerDto extends PagingDto {
  @ApiProperty({
    example: 'CAQ001',
  })
  @IsString()
  categoryAnsCode: string;

  @ApiProperty({
    example: 'YEN',
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

  @ApiProperty({
    example: 'YEN',
  })
  @IsString()
  @IsNotEmpty()
  answerObject: string;

  @ApiProperty({
    example: 'CAQ001',
  })
  @IsString()
  @IsNotEmpty()
  categoryAnsCode: string;
}

export class CreateAnswerDto extends OmitType(UpdateAnswerDto, [
  'answerCode',
] as const) {}
