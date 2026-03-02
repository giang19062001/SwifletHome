import { Controller, HttpStatus, HttpCode, UseInterceptors, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { UserAppService } from 'src/modules/user/app/user.service';
import { UserTypeResDto } from 'src/modules/user/app/user.response';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

@ApiTags('app/user')
@Controller('/api/app/user')
@ApiBearerAuth('app-auth')
// @UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserAppController {
  constructor(private readonly userAppService: UserAppService) {}

  @ApiOperation({
    summary: 'Lấy danh sách loại user ( chủ nhà yến, người thu mua, đội thi công, kỹ thuật...)',
  })
  @Get('getAllUserType')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UserTypeResDto]) })
  async getAllUserType(): Promise<UserTypeResDto[]> {
    const result = await this.userAppService.getAllUserType();
    return result;
  }

  @UseGuards(ApiAuthAppGuard)
  @ApiOperation({
    summary: 'Lấy danh sách loại user được cấp phép chuyển đổi cho user đăng nhập hiện tại',
  })
  @Get('getAllowTypesOfUser')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UserTypeResDto]) })
  async getAllowTypesOfUser(@GetUserApp() user: authInterface.ITokenUserApp): Promise<UserTypeResDto[]> {
    const result = await this.userAppService.getAllowTypesOfUser(user.userCode, user.userTypeKeyWord);
    return result;
  }
}
