import { ApiProperty } from "@nestjs/swagger";
import { YnEnum } from "src/interfaces/admin.interface";
import { TaskStatusEnum } from "./todo.interface";

export class TodoBoxTaskResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    taskCode: string;
    @ApiProperty({ example: '' })
    taskName!: string;
    @ApiProperty({ example: 0 })
    sortOrder: number;
    @ApiProperty({ example: YnEnum.N })
    isActive: YnEnum;
}

export class TodoTaskResDto {
    @ApiProperty({ example: 0 })
    seq: number;
    @ApiProperty({ example: '' })
    taskCode: string;
    @ApiProperty({ example: '' })
    taskName: string;
    @ApiProperty({ example: '' })
    taskKeyword: string;
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

export class TodoTaskAlramResDto {
    @ApiProperty({ example: '' })
    taskAlarmCode!: string;
    @ApiProperty({ example: '' })
    taskKeyword!: string;
    @ApiProperty({ example: '' })
    userCode!: string;
    @ApiProperty({ example: '' })
    taskCode: string | null;
    @ApiProperty({ example: '' })
    userHomeCode: string;
    @ApiProperty({ example: '' })
    taskName: string;
    @ApiProperty({ example: new Date() })
    taskDate: Date;
    @ApiProperty({ example: '' })
    taskStatus: TaskStatusEnum;
    @ApiProperty({ example: '' })
    taskNote: string;
}
