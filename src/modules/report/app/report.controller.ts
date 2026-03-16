import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetHarvertReportDto } from './report.dto';
import { GetHarvertReportDetailResDto, GetHarvertReportSummaryResDto } from './report.response';
import { ReportAppService } from './report.service';

@ApiTags('app/report')
@Controller('/api/app/report')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export default class ReportAppController {
  constructor(private readonly reportAppService: ReportAppService) {}

  // TODO: HARVERT
  @ApiOperation({
    summary: 'Lấy thông tin biểu đồ thu hoạch tổng hợp theo năm',
    description: `
**userHomeCode**: Mã nhà yến \n
**harvestYear**: Số năm\n
**reportType**: enum('SUMMARY','DETAIL')`,
  })
  @ApiBody({
    type: GetHarvertReportDto,
  })
  @Post('getHarvertReport')
  @HttpCode(HttpStatus.OK)
  @ApiExtraModels(GetHarvertReportSummaryResDto, GetHarvertReportDetailResDto)
  @ApiOkResponse({
    description: 'Gía trị trả về phụ thuộc kiểu báo cáo là SUMMARY hoặc DETAIL',
    content: {
      'application/json': {
        schema: {
          oneOf: [{ $ref: getSchemaPath(ApiAppResponseDto(GetHarvertReportSummaryResDto)) }, { $ref: getSchemaPath(ApiAppResponseDto(GetHarvertReportDetailResDto)) }],
        },
        examples: {
          'Reponse of Summary': {
            value: {
              success: true,
              message: 'Success',
              statusCode: 200,
              data: [GetHarvertReportSummaryResDto.mock()],
            },
          },
          'Reponse of Detail': {
            value: {
              success: true,
              message: 'Success',
              statusCode: 200,
              data: [GetHarvertReportDetailResDto.mock()],
            },
          },
        },
      },
    },
  })
  async getHarvertReportSummary(@GetUserApp() user: TokenUserAppResDto, @Body() dto: GetHarvertReportDto) {
    const result = await this.reportAppService.getHarvertReport(dto, user.userCode);
    return result;
  }
}
