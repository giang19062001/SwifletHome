import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class QrRequestFileResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    qrRequestSeq: number;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    uniqueId: string;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}

export class QrRequestFileStrResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    filename: string;
}
