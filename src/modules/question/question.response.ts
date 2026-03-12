import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";

export class QuestionResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    questionCode: string;
    @ApiProperty({ example: '' })
    questionContent: string;
    @ApiProperty({ example: '' })
    questionObject: string;
    @ApiProperty({ example: '' })
    questionCategory: string;
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
    answerCode: string;
    @ApiProperty({ example: '' })
    categoryQuesName!: string;
    @ApiProperty({ example: '' })
    answerContent!: string;
}
