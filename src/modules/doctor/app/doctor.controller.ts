import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateDoctorDto, DoctorFileDto } from './doctor.dto';
import { DoctorAppService } from './doctor.service';
import { getDoctorMulterConfig } from 'src/config/multer.config';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { Msg } from 'src/helpers/message.helper';

@ApiTags('app/doctor')
@Controller('/api/app/doctor')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class DoctorAppController {
  constructor(private readonly doctorAppService: DoctorAppService) {}

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateDoctorDto })
  async create(@GetUserApp() user: userInterface.IUserApp, @Body() dto: CreateDoctorDto) {
    const result = await this.doctorAppService.create(user.userCode, dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return {
      message: Msg.DoctorCreateOk,
      data: result,
    };
  }

  @Post('uploadFile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DoctorFileDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('doctorFiles', 5, getDoctorMulterConfig(5)))
  async uploadFile(@GetUserApp() user: userInterface.IUserApp, @Body() dto: DoctorFileDto, @UploadedFiles() doctorFiles: Express.Multer.File[]) {
    const result = await this.doctorAppService.uploadFile(user.userCode, dto, doctorFiles);
    return result;
  }
}
