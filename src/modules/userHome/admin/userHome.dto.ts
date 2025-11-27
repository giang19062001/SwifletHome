import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';

export class GetHomesAdminDto extends PagingDto{
  @ApiProperty({
    example: "",
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

}
