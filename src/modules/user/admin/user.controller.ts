import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { UserAdminService } from './user.service';
import { PagingDto } from 'src/dto/common';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/user')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/user')
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

    @ApiBody({
      type: PagingDto,
    })
    @Post('getAll')
    @HttpCode(HttpStatus.OK)
    async getAll(@Body() dto: PagingDto){
      const result = await this.userAdminService.getAll(dto);
      return result;
    }
  
}
