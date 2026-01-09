import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Param, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { PackageAdminService } from './package.service';
import { IPackage } from '../package.interface';
import { UpdatePackageDto } from './package.dto';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/admin/auth.interface';

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
  async getAll(@Body() dto: PagingDto): Promise<IList<IPackage>> {
    const result = await this.packageAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'packageCode', type: String })
  @Get('getDetail/:packageCode')
  @HttpCode(HttpStatus.OK)
  async getDetail(@Param('packageCode') packageCode: string): Promise<IPackage | null> {
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
    async update(@Body() dto: UpdatePackageDto, @Param('packageCode') packageCode: string,  @GetUserAdmin() admin: authInterface.ITokenUserAdmin): Promise<number> {
      const result = await this.packageAdminService.update(dto, admin.userId, packageCode);
      if (result === 0) {
        throw new BadRequestException();
      }
      return result;
    }
  
}
