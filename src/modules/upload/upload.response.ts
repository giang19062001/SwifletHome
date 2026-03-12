import { MediaBadgeEnum } from "./upload.interface";
import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class FileUploadResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    filenamePay: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: '' })
    urlLink: string;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
}

export class AudioFreePayResDto {
    @ApiProperty({ example: '' })
    filenameFree: string;
    @ApiProperty({ example: '' })
    mimetypeFree: string;
    @ApiProperty({ example: '' })
    filenamePay: string;
    @ApiProperty({ example: '' })
    mimetypePay: string;
}

export class FileMediaResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: '' })
    urlLink: string;
    @ApiProperty({ example: YnEnum.N })
    isFree!: YnEnum;
    @ApiProperty({ example: YnEnum.N })
    isCoupleFree!: YnEnum;
    @ApiProperty({ example: '' })
    badge: MediaBadgeEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
}
