import { HarvestDataDto } from 'src/modules/todo/app/todo.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDecimal, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';
import { RequestStatusEnum } from '../qr.interface';

export class GetInfoToRequestQrcodeResDto {
  @ApiProperty({ example: '' })
  userName: string;

  @ApiProperty({ example: '' })
  userHomeCode: string;

  @ApiProperty({ example: '' })
  userHomeName: string;

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

  @ApiProperty({ example: '20-11-2025 20:09:04' })
  timestamp: string;
}

export class TaskHarvestQrResDto {
  @ApiProperty({ example: '' })
  harvestTaskAlarmCode: string;

  @ApiProperty({ example: 1 })
  harvestPhase: number;

  @ApiProperty({ example: 2026 })
  harvestYear: number;

  @ApiProperty({ type: () => [HarvestDataDto] })
  @IsArray()
  harvestData: HarvestDataDto[];
}

export class RequestQrCodeResDto extends GetInfoToRequestQrcodeResDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  harvestPhase: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  harvestYear: number;

  @ApiProperty({
    example: RequestStatusEnum.WAITING,
    enum: RequestStatusEnum,
  })
  @IsEnum(RequestStatusEnum)
  requestStatus: RequestStatusEnum;

  @ApiProperty({ example: '' })
  @IsString()
  @IsOptional()
  requestStatusLabel?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  uniqueId: string;
}

export class GetApprovedRequestQrCodeResDto extends OmitType(RequestQrCodeResDto, ['uniqueId'] as const) {
  @ApiProperty({ example: '' })
  @IsString()
  processingPackingVideoUrl: string;

  @ApiProperty({ example: '' })
  @IsString()
  qrCodeUrl: string;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  isSold: YnEnum;
}

export class UploadRequestVideoResDto {
  @ApiProperty({ example: 0 })
  seq: number;

  @ApiProperty({ example: '' })
  filename: string;
}

export class GetRequestQrCodeListResDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  seq: number;

  @ApiProperty({ example: '' })
  @IsString()
  requestCode: string;

  @ApiProperty({ example: '' })
  @IsString()
  userHomeName: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  harvestPhase: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  harvestYear: number;

  @ApiProperty({
    example: RequestStatusEnum.WAITING,
    enum: RequestStatusEnum,
  })
  @IsEnum(RequestStatusEnum)
  requestStatus: RequestStatusEnum;

  @ApiProperty({ example: '' })
  @IsString()
  requestStatusLabel: string;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  isSold: YnEnum;

  @ApiProperty({ example: 0 })
  @IsNumber()
  totalCellCollected: number;
}

export class GetRequestSellListResDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  seq: number;

  @ApiProperty({ example: '' })
  @IsString()
  requestCode: string;

  @ApiProperty({ example: '' })
  @IsString()
  userName: string;

  @ApiProperty({ example: '' })
  @IsString()
  userPhone: string;

  @ApiProperty({ example: '' })
  @IsString()
  userHomeName: string;

  @ApiProperty({ example: '' })
  @IsString()
  priceOptionCode: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  pricePerKg: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  volumeForSell: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  nestQuantity: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  humidity: number;

  @ApiProperty({ example: '' })
  @IsString()
  ingredientNestOptionCode: string;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  isView: YnEnum;

  @ApiProperty({
    example: YnEnum.N,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  isSave: YnEnum;
}
