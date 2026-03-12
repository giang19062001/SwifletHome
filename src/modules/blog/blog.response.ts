import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class BlogResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    blogCode: string;
    @ApiProperty({ example: '' })
    blogName: string;
    @ApiProperty({ example: '' })
    blogObject: string;
    @ApiProperty({ example: '' })
    blogContent: string;
    @ApiProperty({ example: '' })
    blogCategory: string;
    @ApiProperty({ example: '' })
    blogScreenCode: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: YnEnum.N })
    isFree: YnEnum;
    @ApiProperty({ example: YnEnum.N })
    isMain: YnEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
}
