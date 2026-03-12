import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, Param, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ScreenAdminService } from './screen.service';
import { UpdateScreenDto } from './screen.dto';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ListResponseDto } from "src/dto/common.dto";
import { ScreenResDto } from "../screen.response";
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";

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
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: ScreenResDto[] }> {
    const result = await this.screenAdminService.getAll(dto);
    return result;
  }

  @ApiBody({ type: UpdateScreenDto })
  @ApiParam({ name: 'keyword', type: String })
  @Put('update/:keyword')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateScreenDto, @Param('keyword') screenKeyword: string,  @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.screenAdminService.update(dto, admin.userId, screenKeyword);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
