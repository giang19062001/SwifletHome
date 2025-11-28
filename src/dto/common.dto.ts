import { Type } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";


export const ListResonseDto = <TModel extends Type<any>>(model: TModel) => {
  class ListDtoClass {
    @ApiProperty({ example: 10 })
    total: number;

    @ApiProperty({ type: [model] }) 
    list: InstanceType<TModel>[];
  }

  return ListDtoClass;
};