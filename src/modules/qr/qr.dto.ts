import { HarvestDataDto } from 'src/modules/todo/app/todo.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDecimal, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';
import { RequestStatusEnum } from './qr.interface';

export class GetInfoToRequestQrcodeResDto {
  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: 10 })
  userHomeLength: number;

  @ApiProperty({ example: 10 })
  userHomeWidth: number;

  @ApiProperty({ example: 1 })
  userHomeFloor: number;

  @ApiProperty({ example: '' })
  userHomeAddress: string;

  @ApiProperty({ example: 10 })
  temperature: number;

  @ApiProperty({ example: 10 })
  humidity: number;

  @ApiProperty({ type: () => [TaskMedicineQrResDto] })
  @IsArray()
  taskMedicineList: TaskMedicineQrResDto[];

  @ApiProperty({ type: () => [TaskHarvestQrResDto] })
  @IsArray()
  taskHarvestList: TaskHarvestQrResDto[];
}

export class TaskMedicineQrResDto {
  @ApiProperty({ example: '' })
  medicineTaskAlarmCode: string;

  @ApiProperty({ example: '' })
  medicineName: string; // medicineOptionCode or  medicineOther

  @ApiProperty({ example: '' })
  medicineUsage: string;

  @ApiProperty({ example: '20-11-2025' })
  timestamp: string;
}

export class TaskHarvestQrResDto {
  @ApiProperty({ example: '' })
  harvestTaskAlarmCode: string;

  @ApiProperty({ example: 1 })
  harvestPhase: number;

  @ApiProperty({ example: 2026 })
  harvestYear: number;

  @ApiProperty({ type: () => HarvestDataDto })
  @IsArray()
  harvestData: HarvestDataDto[];
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

export class RequestQrCodeFromDbDto extends GetInfoToRequestQrcodeResDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  harvestPhase: number;

  @ApiProperty({
    example: RequestStatusEnum.WAITING,
    enum: RequestStatusEnum,
  })
  @IsEnum(RequestStatusEnum)
  @IsNotEmpty()
  requestStatus: RequestStatusEnum;

  @IsString()
  @IsOptional()
  requestStatusLabel?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  uniqueId: string;
}

export class GetAllInfoRequestQrCodeResDto extends OmitType(RequestQrCodeFromDbDto, ['uniqueId'] as const) {
  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  processingPackingVideoUrl: string;

  @ApiProperty({ example: '' })
  @IsString()
  @IsNotEmpty()
  qrCodeUrl: string;

  @IsString()
  @IsOptional()
  userCode?: string;
}

export class UploadRequestVideoResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;
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
