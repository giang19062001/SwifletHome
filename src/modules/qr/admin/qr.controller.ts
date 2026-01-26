import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, Put, BadRequestException, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { QrAdminService } from './qr.service';
import { IQrRequest } from './qr.inteface';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/admin/auth.interface';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/qrcode')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/qrcode')
export class QrAdminController {
  constructor(private readonly qrAdminService: QrAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto): Promise<IList<IQrRequest>> {
    const result = await this.qrAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'requestCode', type: String })
  @Put('approved/:requestCode')
  @HttpCode(HttpStatus.OK)
  async approved(@Param('requestCode') requestCode: string, @GetUserAdmin() admin: authInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.qrAdminService.approved(requestCode, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiParam({ name: 'requestCode', type: String })
  @Put('refuse/:requestCode')
  @HttpCode(HttpStatus.OK)
  async refuse(@Param('requestCode') requestCode: string, @GetUserAdmin() admin: authInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.qrAdminService.refuse(requestCode, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
