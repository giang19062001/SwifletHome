import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getImgVideoMulterConfig } from 'src/config/multer.config';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ROUTER } from 'src/helpers/const.helper';
import { Msg } from 'src/helpers/message.helper';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "../../auth/admin/auth.response";
import { CreateSaleHomeAdminDto, UpdateSaleHomeAdminDto, UpdateStatusSaleHomeDto, UploadFilesAdminDto } from './saleHome.dto';
import { SaleHomeAdminService } from './saleHome.service';

@ApiTags('Admin - Sale Home')
@ApiBearerAuth()
@UseGuards(ApiAuthAdminGuard)
@Controller(`${ROUTER.ADMIN}/saleHome`)
export class SaleHomeAdminController {
  constructor(private readonly saleHomeAdminService: SaleHomeAdminService) {}

  @ApiOperation({ summary: 'Lấy danh sách nhà yến' })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: PagingDto) {
    const data = await this.saleHomeAdminService.getAllSaleHomes(dto);
    return data;
  }

  @ApiOperation({ summary: 'Chi tiết nhà yến' })
  @Get('getDetail/:homeCode')
  async getDetail(@Param('homeCode') homeCode: string) {
    const data = await this.saleHomeAdminService.getDetailSaleHome(homeCode);
    if (!data) throw new BadRequestException();
    return data;
  }

  @ApiOperation({ summary: 'Tạo mới nhà yến' })
  @Post('create')
  async create(@Body() dto: CreateSaleHomeAdminDto, @GetUserAdmin() admin: TokenUserAdminResDto) {
    const userCode = admin.userId; // admin
    const id = await this.saleHomeAdminService.createSaleHome(dto, userCode);
    if (id === -1) throw new BadRequestException({ message: Msg.HomeAlreadyRegistered });
    if (!id) throw new BadRequestException();
    return id;
  }

  @ApiOperation({ summary: 'Cập nhật nhà yến' })
  @Put('update/:homeCode')
  async update(@Param('homeCode') homeCode: string, @Body() dto: UpdateSaleHomeAdminDto, @GetUserAdmin() admin: TokenUserAdminResDto) {
    const userCode = admin.userId; // admin
    const affected = await this.saleHomeAdminService.updateSaleHome(homeCode, dto, userCode);
    if (!affected) throw new BadRequestException();
    return affected;
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái nhà yến' })
  @Put('updateStatus/:homeCode')
  async updateStatus(@Param('homeCode') homeCode: string, @Body() dto: UpdateStatusSaleHomeDto, @GetUserAdmin() admin: TokenUserAdminResDto) {
    const userCode = admin.userId;
    const affected = await this.saleHomeAdminService.updateStatus(homeCode, dto, userCode);
    if (!affected) throw new BadRequestException();
    return affected;
  }

  @ApiOperation({ summary: 'Upload file nhà yến' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFilesAdminDto })
  @Post('uploadFiles')
  @UseInterceptors(FilesInterceptor('saleHomeFiles', 5, getImgVideoMulterConfig(5)))
  async uploadFiles(@Body() dto: UploadFilesAdminDto, @UploadedFiles() files: Express.Multer.File[], @GetUserAdmin() admin: TokenUserAdminResDto) {
    if (!files || files.length === 0) throw new BadRequestException();
    const userCode = admin.userId; // admin
    const data = await this.saleHomeAdminService.uploadFiles(dto, files, userCode);
    return data;
  }

  @ApiOperation({ summary: 'Xoá file' })
  @Delete('deleteFile/:seq')
  async deleteFile(@Param('seq', ParseIntPipe) seq: number) {
    const affected = await this.saleHomeAdminService.deleteFile(seq);
    if (!affected) throw new BadRequestException();
    return affected;
  }
}
