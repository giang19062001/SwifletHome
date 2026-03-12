import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";
import { DoctorStatusEnum } from "./doctor.interface";

export class DoctorResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    userName: string;
    @ApiProperty({ example: '' })
    userPhone: string;
    @ApiProperty({ example: '' })
    note: string;
    @ApiProperty({ example: '' })
    noteAnswered: string;
    @ApiProperty({ example: '' })
    status: DoctorStatusEnum;
    @ApiProperty({ example: '' })
    uniqueId: string;
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
    doctorFiles: DoctorFileResDto[];
}

export class DoctorFileStrResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    filename: string;
}

export class DoctorFileResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: 0 })
    doctorSeq: number;
    @ApiProperty({ example: '' })
    userCode: string;
    @ApiProperty({ example: '' })
    homeName: string;
    @ApiProperty({ example: '' })
    filename: string;
    @ApiProperty({ example: '' })
    originalname: string;
    @ApiProperty({ example: 0 })
    size: number;
    @ApiProperty({ example: '' })
    mimetype: string;
    @ApiProperty({ example: '' })
    uniqueId: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}
