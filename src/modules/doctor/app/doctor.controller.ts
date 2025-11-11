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

@ApiBearerAuth('swf-token')
@ApiTags('app/doctor')
@UseInterceptors(ResponseAppInterceptor)
@Controller('/api/app/doctor')
export class DoctorAdminController {
  constructor(private readonly doctorAppService: DoctorAppService) {}

  @Post('createDoctor')
  @ApiBody({ type: CreateDoctorDto })
  async createDoctor(@Body() dto: CreateDoctorDto) {
    const result = await this.doctorAppService.createDoctor(dto);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }

  @Post('uploadFileDoctor')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: DoctorFileDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('doctorFiles', 5, getDoctorMulterConfig(5)))
  async uploadFileDoctor(@Body() dto: DoctorFileDto, @UploadedFiles() doctorFiles: Express.Multer.File[]) {
    const result = await this.doctorAppService.insertDoctorFile(dto, doctorFiles);
    return result;
  }
}
