import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { GetInfoRequestQrCodeAdminResDto } from './qr.response';
import { QrAdminService } from './qr.service';

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
  async getAll(@Body() dto: PagingDto): Promise<{ total: number; list: GetInfoRequestQrCodeAdminResDto[] }> {
    const result = await this.qrAdminService.getAll(dto);
    return result;
  }

  @ApiParam({ name: 'requestCode', type: String })
  @Put('approved/:requestCode')
  @HttpCode(HttpStatus.OK)
  async approved(@Param('requestCode') requestCode: string, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.qrAdminService.approved(requestCode, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

}
