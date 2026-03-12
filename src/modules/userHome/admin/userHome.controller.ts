import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { UserHomeAdminService } from './userHome.service';
import { GetHomesAdminDto, TriggerUserHomeSensorDto } from './userHome.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ListResponseDto } from "src/dto/common.dto";
import { UserHomeResDto } from "../app/userHome.dto";
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";

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
