import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto {
  @ApiProperty({
    example: null,
    description: 'Answer code, can be null',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  answerCode: string | null;

  @ApiProperty({
    example: 'YEN',
  })
  @IsString()
  @IsNotEmpty()
  questionObject: string;

  @ApiProperty({
    example: 'Hello word?',
  })
  @IsString()
  @IsNotEmpty()
  questionContent: string;

  @ApiProperty({
    example: 'CAQ001',
  })
  @IsString()
  @IsNotEmpty()
  questionCategory: string;

  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  updatedId: string;
}

export class CreateQuestionDto extends OmitType(UpdateQuestionDto, ['updatedId']) {
  @ApiProperty({
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  createdId: string;
}
