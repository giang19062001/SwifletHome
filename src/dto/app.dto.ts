import { ApiProperty } from '@nestjs/swagger';

export const ApiAppResponseDto = <TModel>(model: new () => TModel) => {
  const modelName = (model as any).name || 'Anonymous';
  const className = `ApiAppResponse${modelName}`;

  class ApiResponseDtoClass {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({ example: 'OK' })
    message: string;

    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ type: model })
    data: TModel;
  }

  Object.defineProperty(ApiResponseDtoClass, 'name', { value: className });
  return ApiResponseDtoClass;
};
