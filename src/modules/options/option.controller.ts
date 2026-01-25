import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetOptionDto } from './option.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { IOpition } from './option.interface';
import { OptionService } from './option.service';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetOptionResDto } from './option.response';

@ApiTags('app/options')
@Controller('/api/app/options')
@UseInterceptors(ResponseAppInterceptor)
export default class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @ApiBody({
    description: `
**mainOption:**
- **SIGHTSEEING**: đăng ký tham quan nhà yến\n
- **TODO_TASK**: tạo lịch nhắc lăn thuốc
- **REQUSET_SELL**: thông tin cho Modal cần bán sản lượng yến


**subOption:**
  - **NUMBER_ATTEND**: số lượng người đăng ký tham quan nhà yến\n
  - **MEDICINE**: Danh sách thuốc
  - **PRICE_OPTION**: Kiểu thiết lập giá
  - **INGREDIENT_NEST**: Loại thanh làm tổ

`,
    type: GetOptionDto,
  })
  @ApiOperation({
    summary: 'Không cần đăng nhập',
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetOptionResDto]) })
  async getAll(@Body() dto: GetOptionDto): Promise<IOpition[]> {
    const result = await this.optionService.getAll(dto);
    return result;
  }
}
