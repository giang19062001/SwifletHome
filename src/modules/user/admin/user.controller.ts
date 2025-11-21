import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserAdminService } from './user.service';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { GetAllUserDto, GetDetailDto } from './user.dto';
import { UpdateUserPaymentAdminDto } from 'src/modules/userPayment/admin/userPayment.dto';

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

    @ApiBody({ type: UpdateUserPaymentAdminDto })
    @ApiParam({ name: 'userCode', type: String })
    @Put('updatePackage/:userCode')
    @HttpCode(HttpStatus.OK)
    async update(@Body() dto: UpdateUserPaymentAdminDto,  @Param('userCode') userCode: string): Promise<number> {
      const result = await this.userAdminService.updatePackage(dto, userCode);
      if (result === 0) {
        throw new BadRequestException();
      }
      return result;
    }
  
}
