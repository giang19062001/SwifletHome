import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { SaleHomeSightseeingAppService } from './saleHome-sightseeing.service';
import { CreateHomeSightSeeingDto } from './saleHome.dto';

@ApiTags('app/homeSale')
@Controller('/api/app/homeSale')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class SaleHomeSightseeingAppController {
  constructor(
    private readonly saleHomeSightseeingAppService: SaleHomeSightseeingAppService,
  ) {}

  // TODO: SIGHTSEEING
  @ApiOperation({
    summary: 'Đăng ký tham quan nhà yến ',
  })
  @ApiBody({
    description: `
**numberAttendCode**: lấy giá trị **code**  từ api/app/options/getAll {mainOption: 'SIGHTSEEING', subOption: 'NUMBER_ATTEND'}
    `,
    type: CreateHomeSightSeeingDto,
  })
  @Post('registerSightSeeing')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async registerSightSeeing(@Body() dto: CreateHomeSightSeeingDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.saleHomeSightseeingAppService.registerSightSeeing(dto, user.userCode);
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
}
