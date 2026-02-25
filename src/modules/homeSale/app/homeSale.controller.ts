import { Controller, Post, Body, HttpStatus, Get, HttpCode, UseGuards, UseInterceptors, BadRequestException, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IHomeSale } from '../homeSale.interface';
import { HomeSaleAppService } from './homeSale.service';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { IListApp } from 'src/interfaces/app.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { CreateHomeSightSeeingDto } from './homeSale.dto';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetHomeSaleDetailResDto, GetHomeSaleResDto } from './homesale.response';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { ListResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';

@ApiTags('app/homeSale')
@Controller('/api/app/homeSale')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class HomeSaleAppController {
  constructor(private readonly homeSaleAppService: HomeSaleAppService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetHomeSaleResDto)) })
  async getAll(@Body() dto: PagingDto): Promise<IListApp<IHomeSale>> {
    const result = await this.homeSaleAppService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'homeCode', type: String })
  @Get('getDetail/:homeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetHomeSaleDetailResDto) })
  async getDetail(@Param('homeCode') homeCode: string): Promise<IHomeSale | null> {
    const result = await this.homeSaleAppService.getDetail(homeCode);
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
  async registerSightSeeing(@Body() dto: CreateHomeSightSeeingDto, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.homeSaleAppService.registerSightSeeing(dto, user.userCode);
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
