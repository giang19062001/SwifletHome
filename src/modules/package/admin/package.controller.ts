import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { PackageResDto } from "../package.response";
import { UpdatePackageDto } from './package.dto';
import { PackageAdminService } from './package.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/package')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/package')
export class PackageAdminController {
  constructor(private readonly packageAdminService: PackageAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: PackageResDto[] }> {
    const result = await this.packageAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'packageCode', type: String })
  @Get('getDetail/:packageCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('packageCode') packageCode: string): Promise<PackageResDto | null> {
    const result = await this.packageAdminService.getDetail(packageCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

    @ApiBody({ type: UpdatePackageDto })
    @ApiParam({ name: 'packageCode', type: String })
    @Put('update/:packageCode')
    @HttpCode(HttpStatus.OK)
    async update(@Body() dto: UpdatePackageDto, @Param('packageCode') packageCode: string,  @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
      const result = await this.packageAdminService.update(dto, admin.userId, packageCode);
      if (result === 0) {
        throw new BadRequestException();
      }
      return result;
    }
  
}
