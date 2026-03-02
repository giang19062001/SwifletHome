import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { UserAppService } from 'src/modules/user/app/user.service';
import { TeamAppService } from './team.service';
import { GetAllTeamDto, GetReviewListOfTeamDto } from './team.dto';
import { ListResponseDto, NullResponseDto } from 'src/dto/common.dto';
import { IList } from 'src/interfaces/admin.interface';
import { GetAllTeamResDto, GetDetailTeamResDto, GetReviewListOfTeamResDto } from './team.response';
import { USER_CONST } from 'src/modules/user/app/user.interface';
import { PagingDto } from 'src/dto/admin.dto';

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
}
