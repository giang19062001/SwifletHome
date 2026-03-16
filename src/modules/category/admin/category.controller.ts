import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { CategoryResDto } from "../category.response";
import { CategoryAdminService } from './category.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/category')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/category')
export class CategoryAdminController {
  constructor(private readonly categoryAdminService: CategoryAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: CategoryResDto[] }> {
    const result = await this.categoryAdminService.getAll(dto);
    return result;
  }
}
