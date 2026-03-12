import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException, Delete, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ChangToMainBlogDto, CreateBlogDto, GetAllBlogDto, UpdateBlogDto } from './blog.dto';
import { BlogAdminService } from './blog.service';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { ListResponseDto } from "src/dto/common.dto";
import { BlogResDto } from "../blog.response";
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";

@ApiBearerAuth('admin-auth')
@ApiTags('admin/blog')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/blog')
export class BlogAdminController {
  constructor(private readonly blogAdminService: BlogAdminService) {}

  @ApiBody({
    type: GetAllBlogDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetAllBlogDto): Promise<{ total: number; list: BlogResDto[] }> {
    const result = await this.blogAdminService.getAll(dto);
    return result;
  }

  @Get('getDetail/:blogCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'blogCode', type: String })
  async getDetail(@Param('blogCode') blogCode: string): Promise<BlogResDto | null> {
    const result = await this.blogAdminService.getDetail(blogCode);
    if (!result) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: CreateBlogDto })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateBlogDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.blogAdminService.create(dto, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: UpdateBlogDto })
  @ApiParam({ name: 'blogCode', type: String })
  @Put('update/:blogCode')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dto: UpdateBlogDto, @Param('blogCode') blogCode: string, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.blogAdminService.update(dto, admin.userId, blogCode);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @ApiBody({ type: ChangToMainBlogDto })
  @ApiParam({ name: 'blogCode', type: String })
  @Put('changeToMain/:blogCode')
  @HttpCode(HttpStatus.OK)
  async changeToMain(@Body() dto: ChangToMainBlogDto, @Param('blogCode') blogCode: string, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.blogAdminService.changeToMain(dto, admin.userId, blogCode);
    // sai logic -> phải luôn gửi Y
    if (dto.isMain == 'N') {
      throw new BadRequestException();
    }
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Delete('delete/:blogCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'blogCode', type: String })
  async delete(@Param('blogCode') blogCode: string): Promise<number> {
    const result = await this.blogAdminService.delete(blogCode);
    if (result === 0) {
      throw new BadRequestException();
    }

    return result;
  }
}
