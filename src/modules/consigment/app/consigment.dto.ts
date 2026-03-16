import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsNumberString, IsString, Min } from 'class-validator';
import { PagingDto } from 'src/dto/admin.dto';
import { MsgDto } from 'src/helpers/message.helper';
import { ConsignmentStatusEnum } from './consigment.interface';

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
    example: '',
  })
  @IsString()
  @IsNotEmpty({ message: MsgDto.CannotNull('nestType') })
  nestType: string;
  
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

export class GetAllConsignmentDto extends PagingDto {

  @ApiProperty({
    example: 'ALL',
    enum: [...Object.values(ConsignmentStatusEnum), 'ALL'],
  })
  @IsNotEmpty()
  @IsIn([...Object.values(ConsignmentStatusEnum), 'ALL'])
  consignmentStatus: ConsignmentStatusEnum | 'ALL';

}