import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { PackageAdminService } from './package.service';
import { IPackage } from '../package.interface';

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
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<IList<IPackage>> {
    const result = await this.packageAdminService.getAll(dto);
    return result;
  }
}
