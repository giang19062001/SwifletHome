import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { getImgVideoMulterConfig, multerImgConfig } from 'src/config/multer.config';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NullResponseDto, NumberErrResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { Msg } from 'src/helpers/message.helper';
import { ImageOptimizerInterceptor } from 'src/interceptors/image-optimizer.interceptor';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { VideoConverterInterceptor } from 'src/interceptors/video-converter.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { USER_CONST } from 'src/modules/user/app/user.const';
import { TokenUserAppResDto } from '../../auth/app/auth.response';
import { TeamReviewAppService } from './team-review.service';
import { TeamUserAppService } from './team-user.service';
import { SaveDraftAppDto, DeleteFileAppDto, GetAllTeamDto, UploadServiceFilesAppDto, UploadTeamFilesAppDto, UploadTeamMainImageAppDto, CreateTeamAppDto } from './team.dto';
import { CheckAvailableTeamResDto, GetAllTeamResDto, GetDetailTeamResDto, InitFormCreateTeamAppResDto, UploadTeamFileResDto } from './team.response';

@ApiTags('app/team')
@Controller('/api/app/team')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TeamAppController {
  constructor(
    private readonly teamUserAppService: TeamUserAppService,
    private readonly teamReviewAppService: TeamReviewAppService,
  ) {}

  // TODO: TEAM
  @ApiOperation({
    summary:
      'Kiểm tra trạng thái đăng ký nhóm ( chưa đăng ký sẽ trả về null ) ⚠️ API này tự động lấy userTypeCode từ token nhưng không còn chuyển đổi token cho xưởng kỹ thuật, đội gia công nữa nên API này sẽ bị xóa ⚠️',
  })
  @Get('checkAvailable')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(CheckAvailableTeamResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async checkAvailable(@GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.checkAvailableTeam(user.userCode, user.userTypeKeyWord);
    return result;
  }
  @ApiOperation({ summary: 'Kiểm tra trạng thái đăng ký nhóm ( chưa đăng ký sẽ trả về null )', description: '**userTypeKeyWord**: enum(FACTORY, TECHNICAL)' })
  @Get('checkAvailable/:userTypeKeyWord')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(CheckAvailableTeamResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async checkAvailableByKeyword(@GetUserApp() user: TokenUserAppResDto, @Param('userTypeKeyWord') userTypeKeyWord: string) {
    if (userTypeKeyWord !== USER_CONST.USER_TYPE.TECHNICAL.value && userTypeKeyWord !== USER_CONST.USER_TYPE.FACTORY.value) {
      throw new BadRequestException({
        message: Msg.InvalidUserType,
        data: null,
      });
    }
    const result = await this.teamUserAppService.checkAvailableTeam(user.userCode, userTypeKeyWord);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin khởi tạo form đăng ký team ⚠️ API này tự động lấy userTypeCode từ token nhưng không còn chuyển đổi token cho xưởng kỹ thuật, đội gia công nữa nên API này sẽ bị xóa ⚠️',
  })
  @Get('getInitFormCreateTeam')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(InitFormCreateTeamAppResDto) })
  async getInitFormCreateTeam(@GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.getInitFormCreateTeam(user.userTypeCode, user.userTypeKeyWord);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin khởi tạo form đăng ký team, bao gồm cả bản nháp đăng ký trước đó nếu có',
    description: `**userTypeKeyWord**: enum(FACTORY, TECHNICAL)\n
  **uuid** sẽ bằng **draft.uuid** nếu **draft** khác null, nếu **draft** là null thì uuid sẽ là uuid mới`,
  })
  @Get('getInitFormSubmitTeam/:userTypeKeyWord')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(InitFormCreateTeamAppResDto) })
  async getInitFormSubmitTeam(@GetUserApp() user: TokenUserAppResDto, @Param('userTypeKeyWord') userTypeKeyWord: string) {
    const result = await this.teamUserAppService.getInitFormSubmitTeam(user.userCode, user.userTypeCode, userTypeKeyWord);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy danh sách các đội kỹ thuật - thi công',
    description: `
**userTypeKeyWord**: enum('FACTORY', ''TECHNICAL)`,
  })
  @ApiBody({
    type: GetAllTeamDto,
  })
  @Post('getAllTeams')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetAllTeamResDto)) })
  async getAllTeams(@Body() dto: GetAllTeamDto, @GetUserApp() user: TokenUserAppResDto): Promise<{ total: number; list: GetAllTeamResDto[] }> {
    if (user.userTypeKeyWord !== USER_CONST.USER_TYPE.OWNER.value) {
      throw new BadRequestException({
        message: Msg.OnlyOwnerCanFetch,
        data: null,
      });
    }
    const result = await this.teamUserAppService.getAllTeams(dto, user.userCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết 1 đội kỹ thuật - thi công ( mô tả, danh sách ảnh ) không lấy bản nháp và không lấy danh sách Review',
    description: `
**teamDescription** là Html,
**teamDescriptionSpecial** { monthlyVolumn: number, minimunQuantity: number,} hoặc 'null'`,
  })
  @Get('getDetailTeam/:teamCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetDetailTeamResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getInfoToRequestQrcode(@Param('teamCode') teamCode: string, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.getDetailTeam(teamCode);
    return result;
  }

  // TODO: TEAM REGISTRATION
  @ApiOperation({
    summary: 'Đăng ký đội kỹ thuật / xưởng gia công mới ⚠️ Sẽ bị xóa vì chuyển sang dùng saveDraft và submitTeam API ⚠️',
    description: `
**servicesData**: Mảng dịch vụ [{"serviceTypeCode": "BUILD_RAW", "serviceTextInput": "nội dung", "uniqueId": "****"}] \n
**teamDescriptionSpecial**: 
- Dành cho xưởng gia công: {"monthlyVolumn": 1000, "minimunQuantity": 10} \n
- Dành cho đội kỹ thuật: null \n
**uniqueId**: uuid này phải đồng nhất với uuid của uploadTeamMainImage, uploadTeamFiles`,
  })
  @Post('createTeam')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: CreateTeamAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async createTeam(@Body() dto: CreateTeamAppDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.createTeam(dto, user.userCode, user.userTypeCode, user.userTypeKeyWord);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    } else if (result === -1) {
      throw new BadRequestException({
        message: Msg.TeamAlreadyRegistered,
        data: 0,
      });
    } else if (result === -2) {
      throw new BadRequestException({
        message: Msg.TeamServiceRequired,
        data: 0,
      });
    } else if (result === -3) {
      throw new BadRequestException({
        message: Msg.TeamServiceDuplicate,
        data: 0,
      });
    }
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Lưu tạm bản nháp đăng ký đội kỹ thuật / xưởng gia công mới',
    description: `
**userTypeKeyWord**: bắt buộc (FACTORY, TECHNICAL)\n
**currentStep**: Mặc định khi khởi tạo là 1, giá trị tối đa của đội kỹ thuật là 4 còn xưởng gia công là 5, nó sẽ giúp ích cho việc nên active step nào trên thanh progress bar của màn hình đăng ký (bắt buộc)\n
**uniqueId**: bắt buộc`,
  })
  @Post('saveDraft')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SaveDraftAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async saveDraft(@Body() dto: SaveDraftAppDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.saveDraft(dto, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    }
    return {
      message: 'Success',
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Kết thúc quá trình lưu tạm hoàn tất đăng ký đội kỹ thuật / xưởng gia công mới',
    description: `
**userTypeKeyWord**: là bắt buộc (FACTORY, TECHNICAL)\n`,
  })
  @Post('submitTeam/:userTypeKeyWord')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  async submitTeam(@Param('userTypeKeyWord') userTypeKeyWord: string, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.submitTeam(userTypeKeyWord, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.RegisterErr,
        data: 0,
      });
    } else if (result === -1) {
      throw new BadRequestException({
        message: Msg.TeamAlreadyRegistered,
        data: 0,
      });
    } else if (result === -2) {
      throw new BadRequestException({
        message: Msg.TeamServiceRequired,
        data: 0,
      });
    } else if (result === -3) {
      throw new BadRequestException({
        message: Msg.TeamServiceDuplicate,
        data: 0,
      });
    } else if (result === -4) {
      throw new BadRequestException({
        message: 'Không tìm thấy bản nháp nào để gửi',
        data: 0,
      });
    }
    return {
      message: Msg.RegisterOk,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Upload ảnh chính cho team', description: 'uuid này phải đồng nhất với uuid của createTeam, uploadTeamFiles' })
  @Post('uploadTeamMainImage')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTeamMainImageAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto(UploadTeamFileResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  @UseInterceptors(FileInterceptor('teamImage', multerImgConfig), ImageOptimizerInterceptor)
  async uploadTeamMainImage(@Body() dto: UploadTeamMainImageAppDto, @GetUserApp() user: TokenUserAppResDto, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException({ message: Msg.FileEmpty, data: null });
    const result = await this.teamUserAppService.uploadTeamMainImage(dto, file, user.userCode);
    return {
      message: Msg.UploadOk,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Upload ảnh/video phụ cho team', description: 'uuid này phải đồng nhất với uuid của createTeam, uploadTeamMainImage' })
  @Post('uploadTeamFiles')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTeamFilesAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto([UploadTeamFileResDto]) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  @UseInterceptors(FilesInterceptor('teamFiles', 20, getImgVideoMulterConfig(20)), ImageOptimizerInterceptor, VideoConverterInterceptor)
  async uploadTeamFiles(@Body() dto: UploadTeamFilesAppDto, @GetUserApp() user: TokenUserAppResDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException({ message: Msg.FileEmpty, data: null });
    const result = await this.teamUserAppService.uploadTeamFiles(dto, files, user.userCode);
    return {
      message: Msg.UploadOk,
      data: result,
    };
  }

  @ApiOperation({ summary: 'Upload ảnh/video cho dịch vụ', description: 'uuid này chỉ đồng nhất với uuid của service hiện tại' })
  @Post('uploadServiceFiles')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadServiceFilesAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto([UploadTeamFileResDto]) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  @UseInterceptors(FilesInterceptor('teamServiceFiles', 20, getImgVideoMulterConfig(20)), ImageOptimizerInterceptor, VideoConverterInterceptor)
  async uploadServiceFiles(@Body() dto: UploadServiceFilesAppDto, @GetUserApp() user: TokenUserAppResDto, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) throw new BadRequestException({ message: Msg.FileEmpty, data: null });
    const result = await this.teamUserAppService.uploadServiceFiles(dto, files, user.userCode);
    return {
      message: Msg.UploadOk,
      data: result,
    };
  }

  @ApiOperation({
    summary: 'Xóa file ảnh/video đã upload cho ảnh chính, ảnh/video phụ, ảnh/video dịch vụ',
    description: `**uploadType**: 
  - teamImage: xóa ảnh chính \n 
  - teamFiles: xóa ảnh/video phụ  \n
  - teamServiceFiles: xóa ảnh/video dịch vụ`,
  })
  @Post('deleteFile')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: DeleteFileAppDto })
  @ApiOkResponse({ type: ApiAppResponseDto(NumberOkResponseDto) })
  @ApiBadRequestResponse({ type: NumberErrResponseDto })
  async deleteFile(@Body() dto: DeleteFileAppDto, @GetUserApp() user: TokenUserAppResDto) {
    const result = await this.teamUserAppService.deleteFile(dto, user.userCode);
    return {
      message: result > 0 ? Msg.DeleteOk : Msg.DeleteErr,
      data: result,
    };
  }
}
