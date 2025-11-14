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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  BadRequestException,
  Delete,
  Param,
  Put,
  UseFilters,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { AnyFilesInterceptor, FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CreateDoctorDto, DoctorFileDto } from './doctor.dto';
import { DoctorAppService } from './doctor.service';
import { getDoctorMulterConfig } from 'src/config/multer';
import { MulterBadRequestFilter } from 'src/filter/uploadError';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';

@ApiTags('app/doctor')
@Controller('/api/app/doctor')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class DoctorAppController {
  constructor(private readonly doctorAppService: DoctorAppService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreateDoctorDto })
  async create(@Body() dto: CreateDoctorDto) {
    const result = await this.doctorAppService.create(dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('uploadFile')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DoctorFileDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('doctorFiles', 5, getDoctorMulterConfig(5)))
  async uploadFile(@Body() dto: DoctorFileDto, @UploadedFiles() doctorFiles: Express.Multer.File[]) {
    const result = await this.doctorAppService.uploadFile(dto, doctorFiles);
    return result;
  }
}
