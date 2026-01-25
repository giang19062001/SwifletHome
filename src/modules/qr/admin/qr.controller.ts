import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { QrAdminService } from './qr.service';
import { IAllQrRequest } from './qr.inteface';


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
  async getAll(@Body() dto: PagingDto): Promise<IList<IAllQrRequest>> {
    const result = await this.qrAdminService.getAll(dto);
    return result;
  }

}
