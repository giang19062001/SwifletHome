import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/admin/auth.interface';
import { PushNotifycationByAdminDto } from './notification.dto';
import { NotificationAdminService } from './notification.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/notification')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/notification')
export class NotificationAdminController {
  constructor(private readonly notificationAdminService: NotificationAdminService) {}

  @ApiBody({ type: PushNotifycationByAdminDto })
  @Post('pushNotifycationByAdmin')
  @HttpCode(HttpStatus.OK)
  async pushNotifycationByAdmin(@Body() dto: PushNotifycationByAdminDto, @GetUserAdmin() admin: authInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.notificationAdminService.pushNotifycationByAdmin(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
