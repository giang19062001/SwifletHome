import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';


export function ListResponseDto<TModel extends Type<any>>(model: TModel) {
  class ListDtoClass {
    @ApiProperty({ example: 10 })
    total: number;

    @ApiProperty({ type: [model] })
    list: InstanceType<TModel>[];
  }

  // đặt tên động cho class -> chống ghi đè
  Object.defineProperty(ListDtoClass, 'name', { value: `List${model.name}Dto` });

  return ListDtoClass;
}

export class NumberOkResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Success' })
  message: string;

  @ApiProperty({ example: 1 })
  data: number;

  @ApiProperty({ example: 200 })
  statusCode: number;
}

export class NumberErrResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Failed' })
  message: string;

  @ApiProperty({ example: 0 })
  data: number;

  @ApiProperty({ example: 400 })
  statusCode: number;
}


export class EmptyArrayResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Failed' })
  message: string;

  @ApiProperty({ type: 'array', example: [] })
  data: [];

  @ApiProperty({ example: 400 })
  statusCode: number;
}


export class NullResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Failed' })
  message: string;

  @ApiProperty({ type: 'null', example: null })
  data: null;

  @ApiProperty({ example: 400 })
  statusCode: number;
}
