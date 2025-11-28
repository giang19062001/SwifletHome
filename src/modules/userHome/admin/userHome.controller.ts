import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IUserHome } from '../userHome.interface';
import { IList } from 'src/interfaces/admin.interface';
import { UserHomeAdminService } from './userHome.service';
import { GetHomesAdminDto, TriggerHomeDto } from './userHome.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import * as userInterface_1 from 'src/modules/user/admin/user.interface';

@ApiTags('admin/user')
@Controller('/api/admin/user')
@ApiBearerAuth('admin-auth')
@UseGuards(ApiAuthAdminGuard)
export class UserHomeAdminController {
  constructor(private readonly userHomeAdminService: UserHomeAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getHomes')
  @HttpCode(HttpStatus.OK)
  async getHomes(@Body() dto: GetHomesAdminDto): Promise<IList<IUserHome>> {
    const result = await this.userHomeAdminService.getAll(dto);
    return result;
  }

  @ApiBody({ type: TriggerHomeDto })
  @ApiParam({ name: 'userHomeCode', type: String })
  @Put('triggerHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  async triggerHome(@Body() dto: TriggerHomeDto, @Param('userHomeCode') userHomeCode: string, @GetUserAdmin() admin: userInterface_1.IUserAdmin): Promise<number> {
    const result = await this.userHomeAdminService.triggerHome(dto.isTriggered, admin.userId, userHomeCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
