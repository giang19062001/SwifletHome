import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  BadRequestException,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IHomeSale } from '../homeSale.interface';
import { HomeSaleAppService } from './homeSale.service';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { IListApp } from 'src/interfaces/app.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { CreateHomeSightSeeingDto } from './homeSale.dto';
import { Msg } from 'src/helpers/message.helper';
import * as userInterface from 'src/modules/user/app/user.interface';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetHomeSaleDetailResDto, GetHomeSaleResDto } from './homesale.response';
import * as authInterface from 'src/modules/auth/app/auth.interface';

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
  @ApiOkResponse({ type: ApiAppResponseDto([GetHomeSaleResDto]) })
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
  @ApiOkResponse({ type: ApiAppResponseDto(Number) })
  async registerSightSeeing(@Body() dto: CreateHomeSightSeeingDto, @GetUserApp() user: authInterface.ITokenUserApp) {
    const result = await this.homeSaleAppService.registerSightSeeing(dto, user.userCode);
    return {
      message: Msg.HomeSummitCreateOk,
      data: result,
    };
  }
}
