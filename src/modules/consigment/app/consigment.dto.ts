import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { MsgDto } from 'src/helpers/message.helper';

export class RequestConsigmentDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty({ message: MsgDto.CannotNull('senderName') })
  senderName: string;

  @ApiProperty({
    example: '',
  })
  @IsNumberString({}, { message: MsgDto.InvalidPhone })
  @IsNotEmpty({ message: MsgDto.CannotNull('senderPhone') })
  senderPhone: string;

  @ApiProperty({
    example: 1,
  })
  @IsInt()
  @IsNotEmpty({ message: MsgDto.CannotNull('nestQuantity') })
  @Min(1, { message: MsgDto.MustBeGreaterZero('nestQuantity')  })
  nestQuantity: number;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty({ message: MsgDto.CannotNull('deliveryAddress') })
  deliveryAddress: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty({ message: MsgDto.CannotNull('receiverName') })
  receiverName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty({ message: MsgDto.CannotNull('receiverPhone') })
  receiverPhone: string;
}
