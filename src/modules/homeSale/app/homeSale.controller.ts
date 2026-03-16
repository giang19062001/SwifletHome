import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { HomeSaleResDto } from '../homeSale.response';
import { HomeSaleIndexAppService } from './homeSale-index.service';
import { HomeSaleSightseeingAppService } from './homeSale-sightseeing.service';
import { CreateHomeSightSeeingDto } from './homeSale.dto';
import { GetHomeSaleDetailResDto, GetHomeSaleResDto } from './homesale.response';

@ApiTags('app/homeSale')
@Controller('/api/app/homeSale')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class HomeSaleAppController {
  constructor(
    private readonly homeSaleIndexAppService: HomeSaleIndexAppService,
    private readonly homeSaleSightseeingAppService: HomeSaleSightseeingAppService,
  ) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetHomeSaleResDto)) })
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: HomeSaleResDto[] }> {
    const result = await this.homeSaleIndexAppService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'homeCode', type: String })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetHomeSaleDetailResDto) })
  async getDetail(@Param('homeCode') homeCode: string): Promise<HomeSaleResDto | null> {
    const result = await this.homeSaleIndexAppService.getDetail(homeCode);
    return result;
  }

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
    const result = await this.homeSaleSightseeingAppService.registerSightSeeing(dto, user.userCode);
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
