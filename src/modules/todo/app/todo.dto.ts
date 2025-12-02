import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { YnEnum } from 'src/interfaces/admin.interface';

// export enum PurposeEnum {
//   REGISTER = 'REGISTER',
//   FORGOT_PASSWORD = 'FORGOT_PASSWORD',
// }

export class CreateHomeSightSeeingDto {
  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsOptional()
  taskCode: string | null;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userCode: string;

  @ApiProperty({
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  userHomeCode: string;

  @ApiProperty({
    example: YnEnum.Y,
    enum: YnEnum,
  })
  @IsEnum(YnEnum)
  @IsNotEmpty()
  isCustomTask: YnEnum;

  @ApiProperty({
    example: null,
    nullable: true,
    required: false,
  })
  @IsOptional()
  taskCustomName: string | null;

//   @ApiProperty({
//     example: PurposeEnum.REGISTER,
//     enum: PurposeEnum,
//   })
//   @IsNotEmpty()
//   @IsEnum(PurposeEnum)
//   purpose: PurposeEnum;
}

// CREATE TABLE
//   tbl_todo_home_task (
//     seq INT AUTO_INCREMENT PRIMARY KEY,
//     taskCode VARCHAR(45) DEFAULT NULL, -- task chọn từ list
//     userCode VARCHAR(45) NOT NULL,
//     userHomeCode VARCHAR(45) NOT NULL,
//     isCustomTask CHAR(1) NOT NULL DEFAULT 'Y', -- N chọn task hoặc Y nhập task
//     taskCustomName VARCHAR(255) DEFAULT NULL,  -- task nhập từ input
//     taskType ENUM ('WEEK', 'MONTH', 'SPECIFIC') DEFAULT 'SPECIFIC', -- chu kỳ tuần, tháng hay chỉ 1 ngày cụ thể trong tương lai
//     taskStatus ENUM ('WAITING', 'COMPLETE', 'CANCEL') DEFAULT 'WAITING',
//     periodValue INT  DEFAULT NULL, --  week ( 0 - 6 : CN - T7); month (1-31)
//     specificValue DATETIME  DEFAULT NULL, -- date cụ thể nếu taskType  là 'SPECIFIC'
//     isActive CHAR(1) NOT NULL DEFAULT 'Y',
//     createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
//     updatedAt DATETIME DEFAULT NULL,
//     createdId VARCHAR(45) DEFAULT 'SYSTEM',
//     updatedId VARCHAR(45) DEFAULT NULL
//   )
