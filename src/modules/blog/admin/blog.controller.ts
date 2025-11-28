import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Req,
  Get,
  HttpCode,
  UseGuards,
  Put,
  BadRequestException,
  Delete,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { IBlog } from '../blog.interface';
import {
  CreateBlogDto,
  GetAllBlogDto,
  UpdateBlogDto,
} from './blog.dto';
import { BlogAdminService } from './blog.service';
import * as userInterface from 'src/modules/auth/admin/auth.interface';
import { GetUserAdmin } from 'src/decorator/auth.decorator';

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
  async getAll(@Body() dto: GetAllBlogDto): Promise<IList<IBlog>> {
    const result = await this.blogAdminService.getAll(dto);
    return result;
  }

  @Get('getDetail/:blogCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'blogCode', type: String })
  async getDetail(
    @Param('blogCode') blogCode: string,
  ): Promise<IBlog | null> {
    const result = await this.blogAdminService.getDetail(blogCode);
     if(!result){
      throw new BadRequestException()
    }
    return result;
  }

  @ApiBody({ type: CreateBlogDto })
  @Post('create')
  @HttpCode(HttpStatus.OK)
  async create(@Body() dto: CreateBlogDto,  @GetUserAdmin() admin: userInterface.ITokenUserAdmin): Promise<number> {
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
  async update(@Body() dto: UpdateBlogDto, @Param('blogCode') blogCode: string, @GetUserAdmin() admin: userInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.blogAdminService.update(dto, admin.userId, blogCode);
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
