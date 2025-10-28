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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { ApiAuthGuard } from 'src/modules/auth/admin/auth.api.guard';
import { HomeService } from './home.service';
import { IHome } from '../home.interface';

@ApiBearerAuth('swf-token') 
@ApiTags('admin/home')
@UseGuards(ApiAuthGuard)
@Controller('/api/admin/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(
    @Body() dto: PagingDto,
  ): Promise<IList<IHome>> {
    const result = await this.homeService.getAll(dto);
    return result;
  }
}
