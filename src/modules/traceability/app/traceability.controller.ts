import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, OnModuleInit, Param, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue, QueueEvents } from 'bullmq';
import type { Request, Response } from 'express';
import { getTraceabilityMulterConfig } from 'src/config/multer.config';
import { GetUserApp, Public } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TokenUserAppResDto } from '../../auth/app/auth.response';
import { TraceabilityAdminService } from '../admin/traceability.service';
import { GetFormDto, SubmitTraceabilityDto, UploadTraceabilityFilesDto } from './traceability.dto';
import { TraceabilityFormResDto, TraceabilityFormSimpleResDto, UploadTraceabilityFileResDto, TraceabilityHouseInfoResDto } from './traceability.response';
import { TraceabilityAppService } from './traceability.service';

@ApiTags('app/traceability')
@Controller('/api/app/traceability')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TraceabilityAppController implements OnModuleInit {
  private queueEvents!: QueueEvents;

  constructor(
    private readonly service: TraceabilityAppService,
    private readonly traceabilityAdminService: TraceabilityAdminService,
    @InjectQueue('pdf') private readonly pdfQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST') || 'localhost';
    const port = this.configService.get<number>('REDIS_PORT') || 6379;
    this.queueEvents = new QueueEvents('pdf', {
      connection: { host, port },
    });
  }

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
    summary: 'Lấy thông tin truy xuất nguồn gốc của từng nhà yến thuộc người dùng',
    description: 'Trả về danh sách đối tượng chứa thông tin cơ bản và trạng thái truy xuất nguồn gốc của từng nhà yến hiện có của user.',
  })
  @Get('getTraceInfoEachHouse')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([TraceabilityHouseInfoResDto]) })
  async getTraceInfoEachHouse(@GetUserApp() user: TokenUserAppResDto) {
    const result = await this.service.getTraceInfoEachHouse(user.userCode);
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
  @UseInterceptors(FilesInterceptor('traceabilityFiles', 5, getTraceabilityMulterConfig(5)), VideoConverterInterceptor)
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

  @ApiOperation({
    summary: 'Tải file PDF hồ sơ truy xuất nguồn gốc',
  })
  @Public()
  @Get('downloadPdf/:traceabilityId')
  async downloadPdf(@Param('traceabilityId') traceabilityId: string, @Req() req: Request, @Res() res: Response) {
    let cleanId = traceabilityId || '';
    if (cleanId.toLowerCase().endsWith('.png')) {
      cleanId = cleanId.slice(0, -4);
    }

    const host = req.get('host') || `127.0.0.1:${process.env.PORT || 3000}`;
    const protocol = req.protocol || 'http';
    const targetUrl = `${protocol}://${host}/traceability-qrcode-global/${cleanId}`;

    const traceData = await this.traceabilityAdminService.getFormForGlobalView(cleanId);

    try {
      const job = await this.pdfQueue.add('generate-pdf', { targetUrl, traceData });
      const base64Data = (await job.waitUntilFinished(this.queueEvents)) as string;
      const pdfBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="3FAM_Bo_ho_so_TXNG_${cleanId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).send('Lỗi máy chủ khi tạo file PDF từ hàng đợi BullMQ');
    }
  }
}
