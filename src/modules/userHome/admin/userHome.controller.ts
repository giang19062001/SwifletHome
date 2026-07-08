import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "../../auth/admin/auth.response";
import { UserHomeResDto } from "../app/userHome.response";
import { GetHomesAdminDto, TriggerUserHomeSensorDto } from './userHome.dto';
import { UserHomeAdminService } from './userHome.service';

@ApiTags('admin/userHome')
@Controller('/api/admin/userHome')
@ApiBearerAuth('admin-auth')
@UseGuards(ApiAuthAdminGuard)
export class UserHomeAdminController {
  constructor(private readonly userHomeAdminService: UserHomeAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getHomes')
  @HttpCode(HttpStatus.OK)
  async getHomes(@Body() dto: GetHomesAdminDto): Promise<{ total: number; list: UserHomeResDto[] }> {
    const result = await this.userHomeAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'userHomeCode', type: String })
  @Get('getDetailHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  async getDetailHome(@Param('userHomeCode') userHomeCode: string): Promise<UserHomeResDto | null> {
    const result = await this.userHomeAdminService.getDetail(userHomeCode);
    return result;
  }

  @ApiBody({ type: TriggerUserHomeSensorDto })
  @ApiParam({ name: 'userHomeCode', type: String })
  @Put('triggerHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  async triggerHome(@Body() dto: TriggerUserHomeSensorDto, @Param('userHomeCode') userHomeCode: string, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.userHomeAdminService.triggerHome(dto, admin.userId, userHomeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: TriggerUserHomeSensorDto })
  @ApiParam({ name: 'userHomeCode', type: String })
  @Put('resetTriggeringHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  async resetTriggeringHome(@Body() dto: TriggerUserHomeSensorDto, @Param('userHomeCode') userHomeCode: string, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.userHomeAdminService.resetTriggeringHome(dto, admin.userId, userHomeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
