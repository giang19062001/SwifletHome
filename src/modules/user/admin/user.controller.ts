import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserAdminService } from './user.service';
import { PagingDto } from 'src/dto/admin';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { GetAllUserDto, GetDetailDto } from './user.dto';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/user')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/user')
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @ApiBody({
    type: GetAllUserDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllUserDto) {
    const result = await this.userAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'userCode', type: String })
  @Post('getDetail/:userCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('userCode') userCode: string, @Body() dto: GetDetailDto) {
    const result = await this.userAdminService.getDetail(userCode, dto.type);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }
}
