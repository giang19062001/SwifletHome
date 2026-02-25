import { Controller, HttpStatus, HttpCode, UseInterceptors, Get, } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { UserAppService } from 'src/modules/user/app/user.service';
import { UserTypeResDto } from 'src/modules/user/app/user.response';
import { ApiAppResponseDto } from 'src/dto/app.dto';

@ApiTags('app/user')
@Controller('/api/app/user')
// @ApiBearerAuth('app-auth')
// @UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserAppController {
  constructor(private readonly userAppService: UserAppService) {}

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
