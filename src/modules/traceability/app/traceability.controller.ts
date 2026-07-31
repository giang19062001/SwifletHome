import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getTraceabilityMulterConfig } from 'src/config/multer.config';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ImageOptimizerInterceptor } from 'src/interceptors/image-optimizer.interceptor';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TokenUserAppResDto } from '../../auth/app/auth.response';
import { GetFormDto, SubmitTraceabilityDto, UploadTraceabilityFilesDto } from './traceability.dto';
import { TraceabilityFormResDto, TraceabilityFormSimpleResDto, UploadTraceabilityFileResDto } from './traceability.response';
import { TraceabilityAppService } from './traceability.service';

@ApiTags('app/traceability')
@Controller('/api/app/traceability')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TraceabilityAppController {
  constructor(private readonly service: TraceabilityAppService) {}

  @ApiOperation({
    summary: 'Lấy danh sách tất cả các form mẫu truy xuất nguồn gốc',
  })
  @Get('getAllForms')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([TraceabilityFormSimpleResDto]) })
  async getAllForms() {
    const result = await this.service.getAllForms();
    return {
      message: Msg.GetOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Lấy cấu trúc form và dữ liệu hiện tại (nếu có)',
    description: 'Truyền formKey và userHomeCode để lấy cấu trúc form kèm dữ liệu currentValue đã lưu tương ứng (nếu có) của user hiện tại.',
  })
  @Get('getForm')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(TraceabilityFormResDto) })
  async getForm(@Query() query: GetFormDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.getForm(query, user.userCode);
    return {
      message: Msg.GetOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Upload tài liệu/hình ảnh/video cho form truy xuất nguồn gốc',
    description: 'Liên kết thông qua uniqueId và fieldKey. Tự động vô hiệu hóa file cũ nếu fieldType = file_single.',
  })
  @Post('uploadFiles')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTraceabilityFilesDto })
  @ApiOkResponse({ type: ApiAppResponseDto([UploadTraceabilityFileResDto]) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  @UseInterceptors(FilesInterceptor('traceabilityFiles', 5, getTraceabilityMulterConfig(5)), ImageOptimizerInterceptor, VideoConverterInterceptor)
  async uploadFiles(@Body() dto: UploadTraceabilityFilesDto, @GetUserApp() user: TokenUserAppResDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException({ message: Msg.FileEmpty, data: null });
    }
    const result = await this.service.uploadFiles(dto, files, user.userCode);
    return {
      message: Msg.UploadOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Xóa file đính kèm đã upload',
  })
  @Delete('deleteFile/:seq')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async deleteFile(@Param('seq') seq: number, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.deleteFile(seq, user.userCode);
    return {
      message: result > 0 ? Msg.DeleteOk : Msg.DeleteErr,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Submit hoặc cập nhật form truy xuất nguồn gốc',
    description: 'Lưu dữ liệu form và tự động liên kết các file đã upload trước đó thông qua uniqueId.',
  })
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SubmitTraceabilityDto })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async submit(@Body() dto: SubmitTraceabilityDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.submit(dto, user.userCode);
    return {
      message: Msg.CreateOk,
      data: result,
    };
  }
}
