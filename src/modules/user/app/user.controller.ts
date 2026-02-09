import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { UserAppService } from 'src/modules/user/app/user.service';
import { UserTypeResDto } from 'src/modules/user/app/user.response';
import { ApiAppResponseDto } from 'src/dto/app.dto';

@ApiTags('app/user')
@Controller('/api/app/user')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserAppController {
  constructor(private readonly userAppService: UserAppService) {}

  //TODO: USER-TYPE
  @ApiOperation({
    summary: 'Lấy thông tin loại user ( chủ nhà yến, người thu mua, đội thi công, kỹ thuật...)',
  })
  @Get('getAllUserType')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UserTypeResDto]) })
  async getAllUserType(): Promise<UserTypeResDto[]> {
    const result = await this.userAppService.getAllUserType();
    return result;
  }
}
