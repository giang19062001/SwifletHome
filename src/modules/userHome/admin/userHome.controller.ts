import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImgConfig } from 'src/config/multer.config';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { PagingDto } from 'src/dto/admin.dto';
import { IUserHome } from '../userHome.interface';
import { IList } from 'src/interfaces/admin.interface';
import { UserHomeAdminService } from './userHome.service';
import { GetHomesAdminDto } from './userHome.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';

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
  async getSwtHouses(@Body() dto: GetHomesAdminDto): Promise<IList<IUserHome>> {
    const result = await this.userHomeAdminService.getAll(dto);
    return result;
  }

}
