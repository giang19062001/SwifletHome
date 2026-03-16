import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";
import { InfoBankResDto } from "../info/info.response";

export class ScreenResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    screenKeyword: string;
    @ApiProperty({ example: '' })
    screenName: string;
    @ApiProperty({ example: '' })
    screenContent: any;
    @ApiProperty({ example: '' })
    screenDescription: string;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
    @ApiProperty({ example: new Date() })
    createdAt: Date;
    @ApiProperty({ example: new Date() })
    updatedAt: Date;
    @ApiProperty({ example: '' })
    createdId!: string;
    @ApiProperty({ example: '' })
    updatedId!: string;
}

export class ScreenRequestDoctorResDto {
    @ApiProperty({ example: '' })
    contentEnd: string;
    @ApiProperty({ example: '' })
    contentStart: string;
    @ApiProperty({ example: '' })
    contentCenter: { symptom : string };
}

export class ScreenSignupServiceResDto {
    @ApiProperty({ example: '' })
    contentEnd: string;
    @ApiProperty({ example: '' })
    contentStart: string;
    @ApiProperty({ example: '' })
    contentCenter: { packages: string[]; bankInfo: InfoBankResDto | null };
}
