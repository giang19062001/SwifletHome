import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class CategoryResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    categoryCode: string;
    @ApiProperty({ example: '' })
    categoryName: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
}
