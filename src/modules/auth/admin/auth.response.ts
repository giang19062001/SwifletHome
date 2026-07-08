import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class TokenUserAdminResDto {
    @ApiProperty({ example: 0 })
    seq: number;

    @ApiProperty({ example: '' })
    userId: string;

    @ApiProperty({ example: '' })
    userPassword: string;

    @ApiProperty({ example: '' })
    userName: string;

    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;

    @ApiProperty({ example: '' })
    userCode!: string;

    @ApiProperty({ example: 0 })
    iat!: number;
    
    @ApiProperty({ example: 0 })
    exp!: number;
}
