import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Res, Param, Req, UseGuards, HttpCode, HttpStatus, Delete, Body, UploadedFiles } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';
import { IAudioFreePay, IFileMedia, IFileUpload } from '../upload.interface';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { UploadAppService } from './upload.service';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto } from 'src/dto/common.dto';
import { GetAllMediaResDto } from './upload.responst';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { IListApp } from 'src/interfaces/app.interface';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { GetAllMediaDto } from './upload.dto';


@ApiTags('app/upload')
@Controller('/api/app/upload')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UploadAppController {
  constructor(private readonly uploadAppService: UploadAppService) {}


   @ApiBody({
      type: GetAllMediaDto,
    })
    @Post('getAllMedia')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetAllMediaResDto)),
       description: `
**MediaType: enum('AUDIO','VIDEO')**` })
    async getAllMedia(@Body() dto: GetAllMediaDto, @GetUserApp() user: authInterface.ITokenUserApp,): Promise<IListApp<IFileMedia>> {
      const result = await this.uploadAppService.getAllMedia(dto, user.userCode);
      return result;
    }
 
}
