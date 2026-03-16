import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ApiMutationResponse } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
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
  async pushNotifycationByAdmin(@Body() dto: PushNotifycationByAdminDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<ApiMutationResponse> {
    const result = await this.notificationAdminService.pushNotifycationByAdmin(dto, admin.userId);
    return result;
  }
}
