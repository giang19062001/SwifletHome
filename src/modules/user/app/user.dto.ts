import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, ValidateIf } from 'class-validator';


export class CreateUserPackageAppDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: null,
    required: false,
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null) // bỏ qua validate khi value string === null
  @IsString()
  packageCode: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  startDate: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  endDate: string | null;
}
