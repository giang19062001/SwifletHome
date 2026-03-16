import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ObjectResDto } from "../object.response";
import { ObjectAdminService } from './object.service';

@ApiBearerAuth('admin-auth') 
@ApiTags('admin/object')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/object')
export class ObjectAdminController {
  constructor(private readonly objectAdminService: ObjectAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<{ total: number; list: ObjectResDto[] }> {
    const result = await this.objectAdminService.getAll(dto);
    return result;
  }
}
