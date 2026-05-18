import { Body, Controller, HttpCode, HttpStatus, Post, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { EaterEntryDto } from './eater.dto';
import { EaterAuthResDto } from './eater.response';
import { EaterAppService } from './eater.service';

@ApiTags('eater-app/auth')
@Controller(['/api/eater-app/auth'])
@UseInterceptors(ResponseAppInterceptor)
export class EaterAppController {
  constructor(private readonly eaterAppService: EaterAppService) {}

  @ApiOperation({
    summary: 'Đăng nhập / Đăng ký dành cho Eater App bằng Device Token',
    description: 'Tự động kiểm tra deviceToken, nếu đã có thì trả về token, nếu chưa có thì tạo mới.',
  })
  @ApiBody({ type: EaterEntryDto })
  @Post('entry')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(EaterAuthResDto) })
  async entry(@Body() dto: EaterEntryDto) {
    const result = await this.eaterAppService.entry(dto);
    return {
      message: Msg.LoginOk,
      data: result,
    };
  }
}
