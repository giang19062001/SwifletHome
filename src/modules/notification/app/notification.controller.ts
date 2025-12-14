import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, UseFilters, Put, Param, Get } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { Msg } from 'src/helpers/message.helper';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { NotificationAppService } from './notification.service';
import { ListResponseDto, NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { LoggingService } from 'src/common/logger/logger.service';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { GetNotificationResDto } from './notification.response';
import { INotification } from '../notification.interface';
import { PagingDto } from 'src/dto/admin.dto';
import { IListApp } from 'src/interfaces/app.interface';

@ApiTags('app/notification')
@Controller('/api/app/notification')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class NotificationAppController {
  constructor(
    private readonly notificationAppService: NotificationAppService,
    private readonly logger: LoggingService,
  ) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetNotificationResDto)),
     description: `
**notificationType: enum('ADMIN','TODO')**\n
**notificationStatus**: enum('SENT','READ')\n
**targetScreen**: 'REMINDER_SCREEN' | 'NOTIFICATION_SCREEN'` })
  async getAll(@Body() dto: PagingDto, @GetUserApp() user: authInterface.ITokenUserApp,): Promise<IListApp<INotification>> {
    const result = await this.notificationAppService.getAll(dto, user.userCode);
    return result;
  }

  @Get('getDetail/:notificationId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'notificationId', type: String })
  @ApiOkResponse({ type: ApiAppResponseDto(GetNotificationResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getDetail(@GetUserApp() user: authInterface.ITokenUserApp, @Param('notificationId') notificationId: string): Promise<INotification | null> {
    const result = await this.notificationAppService.getDetail(notificationId, user.userCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiOperation({
    summary: 'Đánh dấu trạng thái thông báo là đã đọc',
  })
  @Put('maskAsRead/:notificationId')
  @ApiParam({ name: 'notificationId', type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async maskAsRead(@GetUserApp() user: authInterface.ITokenUserApp, @Param('notificationId') notificationId: string) {
    const result = await this.notificationAppService.maskAsRead(notificationId, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }
    return {
      message: Msg.UpdateOk,
      data: result,
    };
  }
}
