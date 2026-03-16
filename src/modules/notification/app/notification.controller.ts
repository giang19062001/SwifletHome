import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { LoggingService } from 'src/common/logger/logger.service';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NullResponseDto, NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { NotificationResDto } from "../notification.response";
import { DeleteNotificationByStatusDto } from './notification.dto';
import { GetNotificationResDto } from './notification.response';
import { NotificationAppService } from './notification.service';

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
  @ApiOkResponse({
    type: ApiAppResponseDto(ListResponseDto(GetNotificationResDto)),
    description: `
**notificationType: enum('ADMIN','TODO')**\n
**notificationStatus**: enum('SENT','READ')\n
**targetScreen**: 'REMINDER_SCREEN' | 'NOTIFICATION_SCREEN' | 'QR_SCREEN'`,
  })
  async getAll(@Body() dto: PagingDto, @GetUserApp() user: TokenUserAppResDto): Promise<{ total: number; list: NotificationResDto[] }> {
    const result = await this.notificationAppService.getAll(dto, user.userCode);
    return result;
  }

  @ApiOperation({
    summary: 'Số lượng thông báo người dùng chưa đọc',
  })
  @Get('getCntNotifyNotReadByUser')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async getCntNotifyNotReadByUser(@GetUserApp() user: TokenUserAppResDto): Promise<number> {
    const result = await this.notificationAppService.getCntNotifyNotReadByUser(user.userCode);
    return result;
  }

  @Get('getDetail/:notificationId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'notificationId', type: String })
  @ApiOkResponse({ type: ApiAppResponseDto(GetNotificationResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getDetail(@GetUserApp() user: TokenUserAppResDto, @Param('notificationId') notificationId: string): Promise<NotificationResDto | null> {
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
  async maskAsRead(@GetUserApp() user: TokenUserAppResDto, @Param('notificationId') notificationId: string) {
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

  @ApiOperation({
    summary: 'Xóa thông báo',
  })
  @Delete('deteteNotification/:notificationId')
  @ApiParam({ name: 'notificationId', type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async deteteNotification(@GetUserApp() user: TokenUserAppResDto, @Param('notificationId') notificationId: string) {
    const result = await this.notificationAppService.deteteNotification(notificationId, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.DeleteErr,
        data: 0,
      });
    }
    return {
      message: Msg.DeleteOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Xóa thông báo theo trạng thái',
  })
  @Delete('deteteNotificationByStatus')
  @ApiBody({
    type: DeleteNotificationByStatusDto,
    description: `
**notificationStatus**: ENUM('ALL','SENT','READ')
 `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async deteteNotificationByStatus(@GetUserApp() user: TokenUserAppResDto, @Body() dto: DeleteNotificationByStatusDto) {
    const result = await this.notificationAppService.deteteNotificationByStatus(dto, user.userCode);
    // if (result === 0) {
    //   throw new BadRequestException({
    //     message: Msg.DeleteErr,
    //     data: 0,
    //   });
    // }
    return {
      message: Msg.DeleteOk,
      data: result,
    };
  }
}
