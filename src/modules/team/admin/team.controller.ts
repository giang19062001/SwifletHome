import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { getImgVideoMulterConfig, multerImgConfig } from 'src/config/multer.config';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { MsgAdmin } from 'src/helpers/message.helper';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "../../auth/admin/auth.response";
import { GetDetailTeamResDto } from '../app/team.response';
import { ChangDisplayReviewDto, CreateTeamDto, DeleteFileDto, UpdateTeamDto, UploadServiceFilesDto, UploadTeamFilesDto, UploadTeamMainImageDto } from './team.dto';
import { TeamResDto, TeamReviewResDto } from "./team.response";
import { TeamAdminService } from './team.service';

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
  async getDetail(@Param('teamCode') teamCode: string): Promise<GetDetailTeamResDto | null> {
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
  @UseInterceptors(FileInterceptor('teamImage', multerImgConfig))
  async create(@Body() createTeamDto: CreateTeamDto, @GetUserAdmin() admin: TokenUserAdminResDto, @UploadedFile() file: Express.Multer.File) {
    const body = {
      ...createTeamDto,
      teamImage: file || createTeamDto.teamImage,
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
  @UseInterceptors(FileInterceptor('teamImage', multerImgConfig))
  async update(@Body() updateTeamDto: UpdateTeamDto, @Param('teamCode') teamCode: string, @GetUserAdmin() admin: TokenUserAdminResDto, @UploadedFile() file: Express.Multer.File) {
    const dto = {
      ...updateTeamDto,
      teamImage: file || updateTeamDto.teamImage,
    };

    const result = await this.teamAdminService.update(dto, admin.userId, teamCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('uploadTeamMainImage')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTeamMainImageDto })
  @UseInterceptors(FileInterceptor('teamImage', multerImgConfig))
  async uploadTeamMainImage(@Body() dto: UploadTeamMainImageDto, @GetUserAdmin() admin: TokenUserAdminResDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const result = await this.teamAdminService.uploadTeamMainImage(dto, file, admin.userId);
    return result;
  }

  @Post('uploadTeamFiles')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTeamFilesDto })
  @UseInterceptors(FilesInterceptor('teamFiles', 20, getImgVideoMulterConfig(20)), VideoConverterInterceptor)
  async uploadTeamFiles(@Body() dto: UploadTeamFilesDto, @GetUserAdmin() admin: TokenUserAdminResDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const result = await this.teamAdminService.uploadTeamFiles(dto, files, admin.userId);
    return result;
  }

  @Post('uploadServiceFiles')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadServiceFilesDto })
  @UseInterceptors(FilesInterceptor('teamServiceFiles', 20, getImgVideoMulterConfig(20)), VideoConverterInterceptor)
  async uploadServiceFiles(@Body() dto: UploadServiceFilesDto, @GetUserAdmin() admin: TokenUserAdminResDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException('No files provided');
    const result = await this.teamAdminService.uploadServiceFiles(dto, files, admin.userId);
    return result;
  }

  @Post('deleteFile')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: DeleteFileDto })
  async deleteFile(@Body() dto: DeleteFileDto, @GetUserAdmin() admin: TokenUserAdminResDto) {
    const result = await this.teamAdminService.deleteFile(dto, admin.userId);
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

  @Put('updateStatus/:teamCode')
  @ApiParam({ name: 'teamCode', type: String })
  @ApiBody({ schema: { properties: { status: { type: 'string', enum: ['APPROVE', 'REFUSE', 'WAITING'] } } } })
  async updateStatus(@Param('teamCode') teamCode: string, @Body('status') status: any, @GetUserAdmin() admin: TokenUserAdminResDto) {
    const result = await this.teamAdminService.updateStatus(teamCode, status, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
