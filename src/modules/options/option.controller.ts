import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetOptionDto, ResOptionDto } from './option.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { IOpition } from './option.interface';
import { OptionService } from './option.service';
import { ApiAppResponseDto } from 'src/dto/app.dto';

@ApiTags('app/options')
@Controller('/api/app/options')
@UseInterceptors(ResponseAppInterceptor)
export default class OptionController {
  constructor(private readonly optionService: OptionService) {}

  @ApiBody({
    description: `
**mainOption:**
- **SUBMIT**: đăng ký tham quan nhà yến  

**subOption:**
  - **NUMBER_ATTEND**: số lượng người đăng ký tham quan nhà yến
`,
    type: GetOptionDto,
  })
  @ApiOperation({
    summary: 'Không cần xác thực',
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([ResOptionDto]) })
  async getAll(@Body() dto: GetOptionDto): Promise<IOpition[]> {
    const result = await this.optionService.getAll(dto);
    if (result.length == 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
