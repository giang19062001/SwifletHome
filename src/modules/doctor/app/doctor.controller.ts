import { getDoctorMulterConfig } from './../../../config/multer.config';
import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateDoctorDto, DoctorFileDto } from './doctor.dto';
import { DoctorAppService } from './doctor.service';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { UploadFileDoctorResDto } from './doctor.response';
import * as authInterface from 'src/modules/auth/app/auth.interface';
import { NumberOkResponseDto } from 'src/dto/common.dto';

@ApiTags('app/doctor')
@Controller('/api/app/doctor')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class DoctorAppController {
  constructor(private readonly doctorAppService: DoctorAppService) {}

  @ApiOperation({
    summary: 'Yêu cầu khám bệnh nhà yến',
  })
  @Post('requestDoctor')
  @ApiBody({ type: CreateDoctorDto, description: '**uuid** dùng khi post dữ liệu phải trùng với **uuid** khi upload file' })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async requestDoctor(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: CreateDoctorDto) {
    const result = await this.doctorAppService.requestDoctor(user.userCode, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.UuidNotFound,
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    }
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }

  @Post('uploadRequestFile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DoctorFileDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('doctorFiles', 5, getDoctorMulterConfig(5)))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UploadFileDoctorResDto]) })
  async uploadRequestFile(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: DoctorFileDto, @UploadedFiles() doctorFiles: Express.Multer.File[]) {
    const result = await this.doctorAppService.uploadRequestFile(user.userCode, dto, doctorFiles);
    return {
      message: result.length ?  Msg.UploadOk : Msg.UploadErr,
      data: result,
    };
  }
}
