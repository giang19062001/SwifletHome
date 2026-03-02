import { HarvestDataInputDto } from 'src/modules/todo/app/todo.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDecimal, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';
import { GetTypeEnum, MarkTypeEnum } from '../qr.interface';
import { PagingDto } from 'src/dto/admin.dto';

export class GetRequestSellListDto extends PagingDto {
  @ApiProperty({
    example: GetTypeEnum.ALL,
    enum: GetTypeEnum,
  })
  @IsEnum(GetTypeEnum)
  @IsNotEmpty()
  getType: GetTypeEnum;
}

export class UploadRequestVideoDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
    description: 'Luôn được generate phía app (uuid)',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  requestQrcodeVideo: any;
}

export class RequestQrCodeDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  harvestPhase: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

// SELL
export class InsertRequestSellDto {
  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  requestCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userPhone: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  priceOptionCode: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  pricePerKg: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  volumeForSell: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  nestQuantity: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsNotEmpty()
  humidity: number;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  ingredientNestOptionCode: string;
}

export class MaskRequestSellDto {
  @ApiProperty({
    example: MarkTypeEnum.SAVE,
    enum: MarkTypeEnum,
  })
  @IsEnum(MarkTypeEnum)
  @IsNotEmpty()
  markType: MarkTypeEnum;
}
