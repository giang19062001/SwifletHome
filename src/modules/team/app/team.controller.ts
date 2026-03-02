import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put, UploadedFiles } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { UserAppService } from 'src/modules/user/app/user.service';
import { TeamAppService } from './team.service';
import { GetAllTeamDto, GetReviewListOfTeamDto, ReviewTeamDto, UploadReviewFilesDto } from './team.dto';
import { ListResponseDto, NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { IList } from 'src/interfaces/admin.interface';
import { GetAllTeamResDto, GetDetailTeamResDto, GetReviewListOfTeamResDto, UploadReviewFilesResDto } from './team.response';
import { USER_CONST } from 'src/modules/user/app/user.interface';
import { PagingDto } from 'src/dto/admin.dto';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerImgConfig } from 'src/config/multer.config';

@ApiTags('app/team')
@Controller('/api/app/team')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TeamAppController {
  constructor(private readonly teamAppService: TeamAppService) {}

  // TODO: TEAM
  @ApiOperation({
    summary: 'Lấy danh sách các đội kỹ thuật - thi công',
    description: ``,
  })
  @ApiBody({
    type: GetAllTeamDto,
  })
  @Post('getAllTeams')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetAllTeamResDto)) })
  async getAllTeams(@Body() dto: GetAllTeamDto, @GetUserApp() user: authInterface.ITokenUserApp): Promise<IList<GetAllTeamResDto>> {
    if (user.userTypeKeyWord !== USER_CONST.USER_TYPE.OWNER.value) {
      throw new BadRequestException({
        message: Msg.OnlyOwnerCanFetch,
        data: null,
      });
    }
    const result = await this.teamAppService.getAllTeams(dto, user.userCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết 1 đội kỹ thuật - thi công ( mô tả, danh sách ảnh ) ngoại trừ danh sách Review',
    description: `
**teamDescription** là Html,
**teamDescriptionSpecial** có thể là 'Object <key: string>' hoặc 'null'`,
  })
  @Get('getDetailTeam/:teamCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetDetailTeamResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getInfoToRequestQrcode(@Param('teamCode') teamCode: string, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.teamAppService.getDetailTeam(teamCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy danh sách review của 1 team',
    description: ``,
  })
  @ApiBody({
    type: GetReviewListOfTeamDto,
  })
  @Post('getReviewListOfTeam')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetReviewListOfTeamResDto)) })
  async getReviewListOfTeam(@Body() dto: GetReviewListOfTeamDto, @GetUserApp() user: authInterface.ITokenUserApp): Promise<IList<GetReviewListOfTeamResDto>> {
    if (user.userTypeKeyWord !== USER_CONST.USER_TYPE.OWNER.value) {
      throw new BadRequestException({
        message: Msg.OnlyOwnerCanFetch,
        data: null,
      });
    }
    const result = await this.teamAppService.getReviewListOfTeam(dto);
    return result;
  }

  @ApiOperation({
    summary: 'Viết đánh giá',
  })
  @Post('reviewTeam')
  @ApiBody({ type: ReviewTeamDto, description: `
**uuid** dùng khi post dữ liệu phải trùng với **uuid** khi upload file\N
**star**: number (1 -> 5 )\n
**review**: text (nội dung)` })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async reviewTeam(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: ReviewTeamDto) {
    const result = await this.teamAppService.reviewTeam(user.userCode, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.UuidNotFound,
        data: 0,
      });
    }
    if (result === -2) {
      throw new BadRequestException({
        message: Msg.TeamNotFound,
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    }
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }

  @Post('uploadReviewFiles')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadReviewFilesDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('reviewImg', 5, multerImgConfig))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UploadReviewFilesResDto]) })
  async uploadReviewFiles(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: UploadReviewFilesDto, @UploadedFiles() reviewImgs: Express.Multer.File[]) {
    const result = await this.teamAppService.uploadReviewFiles(user.userCode, dto, reviewImgs);
    return {
      message: result.length ? Msg.UploadOk : Msg.UploadErr,
      data: result,
    };
  }
}
