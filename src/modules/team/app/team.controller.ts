import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { UserAppService } from 'src/modules/user/app/user.service';
import { TeamAppService } from './team.service';
import { GetAllTeamDto } from './team.dto';
import { ListResponseDto } from 'src/dto/common.dto';
import { IList } from 'src/interfaces/admin.interface';
import { GetAllTeamResDto } from './team.response';
import { USER_CONST } from 'src/modules/user/app/user.interface';

@ApiTags('app/team')
@Controller('/api/app/team')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TeamAppController {
  constructor(private readonly teamAppService: TeamAppService) {}

  // TODO: USER-HOME
  @ApiBody({
    type: GetAllTeamDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetAllTeamResDto)) })
  async getAll(@Body() dto: GetAllTeamDto, @GetUserApp() user: authInterface.ITokenUserApp): Promise<IList<GetAllTeamResDto>> {
    if (user.userTypeKeyWord !== USER_CONST.USER_TYPE.OWNER.value) {
      throw new BadRequestException({
        message: Msg.OnlyOwnerCanFetch,
        data: null,
      });
    }
    const result = await this.teamAppService.getAll(dto);
    return result;
  }
}
