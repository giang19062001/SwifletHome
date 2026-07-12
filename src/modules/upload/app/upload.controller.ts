import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto } from 'src/dto/common.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TokenUserAppResDto } from '../../auth/app/auth.response';
import { GetAllMediaDto } from './upload.dto';
import { FileMediaAppResDto, GetAllMediaResDto } from './upload.response';
import { UploadAppService } from './upload.service';

@ApiTags('app/upload')
@Controller('/api/app/upload')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UploadAppController {
  constructor(private readonly uploadAppService: UploadAppService) {}

  @ApiBody({
    type: GetAllMediaDto,
  })
  @Post('getAllMedia')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ApiAppResponseDto(ListResponseDto(GetAllMediaResDto)),
    description: `
**MediaType: enum('AUDIO','VIDEO')**\n
**badge: enum('NEW','NORMAL')**`,
  })
  async getAllMedia(@Body() dto: GetAllMediaDto, @GetUserApp() user: TokenUserAppResDto): Promise<{ total: number; list: FileMediaAppResDto[] }> {
    const result = await this.uploadAppService.getAllMedia(dto, user.userCode);
    return result;
  }
}
