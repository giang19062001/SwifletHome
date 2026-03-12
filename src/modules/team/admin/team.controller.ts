import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  BadRequestException,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerImgConfig } from 'src/config/multer.config';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { TeamAdminService } from './team.service';
import { ChangDisplayReviewDto, CreateTeamDto, UpdateTeamDto, TeamResDto, TeamReviewResDto } from './team.dto';
import { MsgAdmin } from 'src/helpers/message.helper';
import { ListResponseDto } from "src/dto/common.dto";
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";

@ApiBearerAuth('admin-auth')
@ApiTags('admin/team')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/team')
export class TeamAdminController {
  constructor(private readonly teamAdminService: TeamAdminService) {}

  // TODO: TEAM
  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: TeamResDto[] }> {
    const result = await this.teamAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'teamCode', type: String })
  @Get('getDetail/:teamCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('teamCode') teamCode: string): Promise<TeamResDto | null> {
    const result = await this.teamAdminService.getDetail(teamCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateTeamDto })
  // @UseInterceptors(AnyFilesInterceptor(multerImgConfig))
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'teamImage', maxCount: 1 },
        { name: 'teamImages', maxCount: 10 },
      ],
      multerImgConfig,
    ),
  )
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @GetUserAdmin() admin: TokenUserAdminResDto,
    // @UploadedFiles() files: Express.Multer.File[],
    @UploadedFiles()
    files: {
      teamImage?: Express.Multer.File[];
      teamImages?: Express.Multer.File[];
    },
  ) {
    const teamImage = files.teamImage?.[0] || null;
    const teamImages = files.teamImages || [];
    const body = {
      ...createTeamDto,
      teamImage,
      teamImages,
    };

    const result = await this.teamAdminService.create(body, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    } else if (result === -1) {
      throw new BadRequestException({
        message: MsgAdmin.userAlreadyCreateThisTeam,
      });
    }
    return result;
  }

  @Put('update/:teamCode')
  @ApiParam({ name: 'teamCode', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateTeamDto })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'teamImage', maxCount: 1 },
        { name: 'teamImages', maxCount: 10 },
      ],
      multerImgConfig,
    ),
  )
  async update(
    @Body() updateTeamDto: UpdateTeamDto,
    @Param('teamCode') teamCode: string,
    @GetUserAdmin() admin: TokenUserAdminResDto,
    @UploadedFiles()
    files: {
      teamImage?: Express.Multer.File[];
      teamImages?: Express.Multer.File[];
    },
  ) {
    const teamImage = files.teamImage?.[0] || null;
    const teamImages = files.teamImages || [];
    const dto = {
      ...updateTeamDto,
      teamImage,
      teamImages,
    };

    const result = await this.teamAdminService.update(dto, admin.userId, teamCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  // @Delete('delete/:teamCode')
  // @HttpCode(HttpStatus.OK)
  // @ApiParam({ name: 'teamCode', type: String })
  // async delete(@Param('teamCode') teamCode: string): Promise<number> {
  //   const result = await this.teamAdminService.delete(teamCode);
  //   if (result === 0) {
  //     throw new BadRequestException();
  //   }
  //   return result;
  // }

  // TODO: REVIEW
  @ApiBody({
    type: PagingDto,
  })
  @Post('getAllReview')
  @HttpCode(HttpStatus.OK)
  async getAllReview(@Body() dto: PagingDto): Promise<{ total: number; list: TeamReviewResDto[] }> {
    const result = await this.teamAdminService.getAllReview(dto);
    return result;
  }

  @ApiParam({ name: 'seq', type: Number })
  @Get('getDetailReview/:seq')
  @HttpCode(HttpStatus.OK)
  async getDetailReview(@Param('seq') seq: number): Promise<TeamReviewResDto | null> {
    const result = await this.teamAdminService.getDetailReview(seq);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

    @ApiBody({ type: ChangDisplayReviewDto })
    @ApiParam({ name: 'seq', type: String })
    @Put('changeDisplay/:seq')
    @HttpCode(HttpStatus.OK)
    async changeDisplay(@Body() dto: ChangDisplayReviewDto, @Param('seq') seq: number, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
      const result = await this.teamAdminService.changeDisplay(dto, admin.userId, seq);
      if (result === 0) {
        throw new BadRequestException();
      }
      return result;
    }
  
}
