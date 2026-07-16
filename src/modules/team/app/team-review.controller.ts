import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, UploadedFiles, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { multerImgConfig } from 'src/config/multer.config';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { Msg } from 'src/helpers/message.helper';
import { ImageOptimizerInterceptor } from 'src/interceptors/image-optimizer.interceptor';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { TokenUserAppResDto } from '../../auth/app/auth.response';
import { TeamReviewAppService } from './team-review.service';
import { GetReviewListOfTeamDto, ReviewTeamDto, UploadReviewFilesDto } from './team.dto';
import { GetReviewListOfTeamResDto, UploadReviewFilesResDto } from './team.response';

@ApiTags('app/team')
@Controller('/api/app/team')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class TeamReviewAppController {
  constructor(private readonly teamReviewAppService: TeamReviewAppService) {}

  @ApiOperation({
    summary: 'Lấy danh sách review của 1 team',
    description: ``,
  })
  @ApiBody({
    type: GetReviewListOfTeamDto,
  })
  @Post('getReviewListOfTeam')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetReviewListOfTeamResDto)) })
  async getReviewListOfTeam(@Body() dto: GetReviewListOfTeamDto, @GetUserApp() user: TokenUserAppResDto): Promise<{ total: number; list: GetReviewListOfTeamResDto[] }> {
    const result = await this.teamReviewAppService.getReviewListOfTeam(dto);
    return result;
  }

  @ApiOperation({
    summary: 'Viết đánh giá',
  })
  @Post('reviewTeam')
  @ApiBody({
    type: ReviewTeamDto,
    description: `
**uuid** dùng khi post dữ liệu phải trùng với **uuid** khi upload file\n
**star**: number (1 -> 5 )\n
**review**: text (nội dung)`,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async reviewTeam(@GetUserApp() user: TokenUserAppResDto, @Body() dto: ReviewTeamDto) {
    const result = await this.teamReviewAppService.reviewTeam(user.userCode, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.UuidNotFound,
        data: 0,
      });
    }
    if (result === -2) {
      throw new BadRequestException({
        message: Msg.TeamNotFound,
        data: 0,
      });
    }
    if (result === -3) {
      throw new BadRequestException({
        message: Msg.YouAlreadyReview,
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

  @Post('uploadReviewFiles')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadReviewFilesDto })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FilesInterceptor('reviewImg', 5, multerImgConfig), ImageOptimizerInterceptor)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto([UploadReviewFilesResDto]) })
  async uploadReviewFiles(@GetUserApp() user: TokenUserAppResDto, @Body() dto: UploadReviewFilesDto, @UploadedFiles() reviewImgs: Express.Multer.File[]) {
    const result = await this.teamReviewAppService.uploadReviewFiles(user.userCode, dto, reviewImgs);
    return {
      message: result.length ? Msg.UploadOk : Msg.UploadErr,
      data: result,
    };
  }
}
