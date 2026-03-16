import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { GetAllUserDto, GetDetailDto, GetUsersForTeamByTypeDto, UpdateUserPackageAdminDto } from './user.dto';
import { UserAdminService } from './user.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/user')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/user')
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  @ApiBody({
    type: GetAllUserDto,
  })
  @Post('getAllUser')
  @HttpCode(HttpStatus.OK)
  async getAllUser(@Body() dto: GetAllUserDto) {
    const result = await this.userAdminService.getAllUser(dto);
    return result;
  }

  
  @ApiBody({
    type: GetUsersForTeamByTypeDto,
  })
  @Post('getUsersForTeamByType')
  @HttpCode(HttpStatus.OK)
  async getUsersForTeamByType(@Body() dto: GetUsersForTeamByTypeDto) {
    const result = await this.userAdminService.getUsersForTeamByType(dto);
    return result;
  }

  @ApiParam({ name: 'userCode', type: String })
  @Post('getDetailUser/:userCode')
  @HttpCode(HttpStatus.OK)
  async getDetailUser(@Param('userCode') userCode: string, @Body() dto: GetDetailDto) {
    const result = await this.userAdminService.getDetailUser(userCode, dto.type);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

    @ApiBody({ type: UpdateUserPackageAdminDto })
    @ApiParam({ name: 'userCode', type: String })
    @Put('updatePackage/:userCode')
    @HttpCode(HttpStatus.OK)
    async update(@Body() dto: UpdateUserPackageAdminDto,  @Param('userCode') userCode: string,  @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
      // cập nhâp gói miễn phí -> bỏ qua
      if(dto.packageCode == ''){
      return 1
     }
      const result = await this.userAdminService.updatePackage(dto, admin.userId, userCode);
      if (result === 0) {
        throw new BadRequestException();
      }
      return result;
    }
  
}
