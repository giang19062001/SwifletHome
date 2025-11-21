import { ApiProperty } from '@nestjs/swagger';

export const ApiAppResponseDto = <TModel>(model: any) => {
  const isArray = Array.isArray(model);
  const actualModel = isArray ? model[0] : model;

  const modelName = actualModel?.name || 'Anonymous';
  const className = `ApiAppResponse${modelName}${isArray ? 'Array' : ''}`;

  class ApiResponseDtoClass {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'OK' })
    message: string;

    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({
      type: actualModel,
      isArray: isArray,
    })
    data: TModel;
  }

  Object.defineProperty(ApiResponseDtoClass, 'name', { value: className });
  return ApiResponseDtoClass;
};
