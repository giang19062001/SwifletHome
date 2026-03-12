import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class ObjectResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    objectKeyword: 'SWIFTLET' | 'TEA' | 'COFFEE';
    @ApiProperty({ example: '' })
    objectName: string;
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
