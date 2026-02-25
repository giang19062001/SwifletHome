import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';


export class UpdateAnswerDto {
  @ApiProperty({ example: '<p>Hello word</p>' })
  @IsNotEmpty()
  @IsString()
  answerContent: string;

  @ApiProperty({
    example: 'SWIFTLET',
  })
  @IsString()
  @IsNotEmpty()
  answerObject: string;

  @ApiProperty({
    example: 'CAQ001',
  })
  @IsString()
  @IsNotEmpty()
  answerCategory: string;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isFree: YnEnum;

}

export class CreateAnswerDto extends UpdateAnswerDto {}
