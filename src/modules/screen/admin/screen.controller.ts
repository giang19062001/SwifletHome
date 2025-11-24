import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Param, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ScreenAdminService } from './screen.service';
import { IScreen } from '../screen.interface';
import { UpdateScreenDto } from './screen.dto';
import * as userInterface from 'src/modules/user/admin/user.interface';
import { GetUserAdmin } from 'src/decorator/auth.decorator';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/screen')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/screen')
export class ScreenAdminController {
  constructor(private readonly screenAdminService: ScreenAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IScreen>> {
    const result = await this.screenAdminService.getAll(dto);
    return result;
  }

  @ApiBody({ type: UpdateScreenDto })
  @ApiParam({ name: 'keyword', type: String })
  @Put('update/:keyword')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateScreenDto, @Param('keyword') screenKeyword: string,  @GetUserAdmin() admin: userInterface.IUserAdmin): Promise<number> {
    const result = await this.screenAdminService.update(dto, admin.userId, screenKeyword);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
