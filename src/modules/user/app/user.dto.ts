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

export class UserPackageAppResDto {
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    packageCode: string | null;
    @ApiProperty({ example: '' })
    packageName: string;
    @ApiProperty({ example: '' })
    packageDescription: string;
    @ApiProperty({ example: 0 })
    packageRemainDay: number;
    @ApiProperty({ example: '' })
    startDate: string | null;
    @ApiProperty({ example: '' })
    endDate: string | null;
}

export class UserTypeAppResDto {
    @ApiProperty({ example: '' })
    userTypeCode: string;
    @ApiProperty({ example: '' })
    userTypeKeyWord: string;
    @ApiProperty({ example: '' })
    userTypeName: string;
}

export class UserAppResDto {
    @ApiProperty({ example: 0 })
    homesTotal: number;
    @ApiProperty({ example: '' })
    userCode!: string;
    @ApiProperty({ example: '' })
    userName!: string;
    @ApiProperty({ example: '' })
    userPhone!: string;
    @ApiProperty({ example: '' })
    countryCode!: string;
    @ApiProperty({ example: '' })
    userPassword!: string;
    @ApiProperty({ example: '' })
    deviceToken!: string;
    @ApiProperty({ example: '' })
    packageCode!: string;
    @ApiProperty({ example: '' })
    packageName!: string;
    @ApiProperty({ example: '' })
    packageDescription!: string;
    @ApiProperty({ example: 0 })
    packageRemainDay!: number;
    @ApiProperty({ example: '' })
    startDate!: string | null;
    @ApiProperty({ example: '' })
    endDate!: string | null;
}
