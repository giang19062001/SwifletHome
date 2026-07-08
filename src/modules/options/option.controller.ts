import { Body, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { GetOptionDto } from './option.dto';
import { GetOptionResDto } from './option.response';
import { OptionService } from './option.service';

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
- **CONSIGNMENT_NEST**: thông tin loại yến cho form ký gửi


**subOption:**
  - **NUMBER_ATTEND**: số lượng người đăng ký tham quan nhà yến (**SIGHTSEEING**)\n
  - **MEDICINE**: Danh sách thuốc (**TODO_TASK**)\n
  - **PRICE_OPTION**: Kiểu thiết lập giá (**REQUSET_SELL**)\n
  - **INGREDIENT_NEST**: Loại thanh làm tổ (**REQUSET_SELL**)\n
  - **NEST_TYPE**: Loại yến để ký gửi (**CONSIGNMENT_NEST**)\n

`,
    type: GetOptionDto,
  })
  @ApiOperation({
    summary: 'Không cần đăng nhập',
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([GetOptionResDto]) })
  async getAll(@Body() dto: GetOptionDto): Promise<GetOptionResDto[]> {
    const result = await this.optionService.getAll(dto);
    return result;
  }
}
