import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";
import { HomeSaleSightSeeingStatusEnum } from "./homeSale.interface";

export class HomeSaleResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    homeCode: string;
    @ApiProperty({ example: '' })
    homeName: string;
    @ApiProperty({ example: '' })
    homeAddress: string;
    @ApiProperty({ example: '' })
    homeDescription: string;
    @ApiProperty({ example: 0 })
    latitude: number;
    @ApiProperty({ example: 0 })
    longitude: number;
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
    @ApiProperty({ example: '' })
    homeImage: string | HomeSaleImgResDto;
    @ApiProperty({ example: '' })
    homeImages: HomeSaleImgResDto[];
}

export class HomeSaleImgResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    homeSeq: number;
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
    @ApiProperty({ example: 0 })
    width!: number;
    @ApiProperty({ example: 0 })
    height!: number;
}

export class HomeSaleSightSeeingResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    homeCode: string;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    userName: string;
    @ApiProperty({ example: '' })
    userPhone: string;
    @ApiProperty({ example: '' })
    numberAttend: string;
    @ApiProperty({ example: '' })
    status: HomeSaleSightSeeingStatusEnum;
    @ApiProperty({ example: '' })
    note: string;
    @ApiProperty({ example: '' })
    cancelReason: string;
    @ApiProperty({ example: '' })
    createdId: string;
    @ApiProperty({ example: '' })
    updatedId: string;
}
