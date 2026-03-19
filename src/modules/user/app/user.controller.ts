import { Controller, Get, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { AllowUserTypeResDto, UserTypeResDto } from 'src/modules/user/app/user.response';
import { UserAppService } from 'src/modules/user/app/user.service';

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
  @ApiOkResponse({ type: ApiAppResponseDto([AllowUserTypeResDto]), description:`**isSetted** có giá trị bằng 'Y' là user này đã đăng ký thông tin loại người dùng này rồi, 'N' là chưa có thông tin \n
**teamCode**: (string | null) teamCode sẽ != null khi userTypeKeyWord là ('FACTORY' or 'TECHNICAL') và  (isSetted = 'Y') ` })
  async getAllowTypesOfUser(@GetUserApp() user: TokenUserAppResDto): Promise<AllowUserTypeResDto[]> {
    const result = await this.userAppService.getAllowTypesOfUser(user.userCode, user.userTypeKeyWord);
    return result;
  }
}
