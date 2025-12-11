import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException, UseFilters, UploadedFile, Param, Get, Delete, Put } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImgConfig } from 'src/config/multer.config';
import { MulterBadRequestFilter } from 'src/filter/uploadError.filter';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import * as userInterface from 'src/modules/user/app/user.interface';
import { Msg } from 'src/helpers/message.helper';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { UserHomeAppService } from './userHome.service';
import { MutationUserHomeDto, UploadUserHomeImageDto } from './userHome.dto';
import { PagingDto } from 'src/dto/admin.dto';
import { IUserHome } from '../userHome.interface';
import { ListResponseDto, NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { IList } from 'src/interfaces/admin.interface';
import { GetHomeUserResDto, UserHomeImageResDto, GetHomesUserResDto } from './userHome.response';
import * as authInterface from 'src/modules/auth/app/auth.interface';

@ApiTags('app/user')
@Controller('/api/app/user')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class UserHomeAppController {
  constructor(private readonly userHomeAppService: UserHomeAppService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getHomes')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetHomesUserResDto)) })
  async getSwtHousgetHomeses(@Body() dto: PagingDto, @GetUserApp() user: authInterface.ITokenUserApp): Promise<IList<IUserHome>> {
    const result = await this.userHomeAppService.getAll(dto, user.userCode);
    return result;
  }

  @ApiParam({ name: 'userHomeCode', type: String })
  @Get('getDetailHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetHomeUserResDto) })
  async getDetailHome(@Param('userHomeCode') userHomeCode: string): Promise<IUserHome | null> {
    const result = await this.userHomeAppService.getDetail(userHomeCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin nhà yến chính của user hiện tại',
  })
  @Get('getMainHomeByUser')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetHomeUserResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getMainHomeByUser(@GetUserApp() user: authInterface.ITokenUserApp): Promise<IUserHome | null> {
    const result = await this.userHomeAppService.getMainHomeByUser(user.userCode);
    return result;
  }

  @Delete('deleteHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userHomeCode', type: String })
  @ApiOkResponse({ type: NumberOkResponseDto })
  async deleteHome(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp): Promise<number> {
    const result = await this.userHomeAppService.deleteHome(userHomeCode, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.DeleteErr,
        data: 0,
      });
    }

    return result;
  }

  @ApiOperation({
    summary: 'Cập nhập nhà yến thành nhà yến chính',
  })
  @Put('updateHomeToMain/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'userHomeCode', type: String })
  @ApiOkResponse({ type: NumberOkResponseDto })
  async updateHomeToMain(@Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp): Promise<number> {
    const result = await this.userHomeAppService.updateHomeToMain(userHomeCode, user.userCode);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }

    return result;
  }

  @ApiBody({
    type: MutationUserHomeDto,
    description: `Nếu chỉ thay đổi dữ liệu, không upload ảnh thì **uniqueId** giữ giá trị như cũ từ **/api/app/user/getHomeDetal** trả về.\n
 Nếu có upload ảnh trước đó thì **uniqueId** sẽ là giá trị **uuid** được generate phía app\n
 **userHomeProvince** là **provinceCode** lấy từ */api/app/province/getAll*`,
  })
  @ApiParam({ name: 'userHomeCode', type: String })
  @Put('updateHome/:userHomeCode')
  @HttpCode(HttpStatus.OK)
  async updateHome(@Body() dto: MutationUserHomeDto, @Param('userHomeCode') userHomeCode: string, @GetUserApp() user: authInterface.ITokenUserApp): Promise<number> {
    const result = await this.userHomeAppService.updateHome(user.userCode, userHomeCode, dto);
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.UpdateErr,
        data: 0,
      });
    }
    return result;
  }

  @Post('createHome')
  @ApiBody({
    type: MutationUserHomeDto,
    description: `
**uniqueId** sẽ là giá trị **uuid** được generate phía app\n
**userHomeProvince** là **provinceCode** lấy từ */api/app/province/getAll*
  `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async createHome(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: MutationUserHomeDto) {
    const result = await this.userHomeAppService.createHome(user.userCode, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.UuidNotFound,
        data: 0,
      });
    }
    if (result === -2) {
      throw new BadRequestException({
        message: Msg.InvalidPackageToAddHome,
        data: 0,
      });
    }
    if (result === 0) {
      throw new BadRequestException({
        message: Msg.CreateErr,
        data: 0,
      });
    }
    return {
      message: Msg.CreateOk,
      data: result,
    };
  }

  @Post('uploadHomeImage')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UploadUserHomeImageDto,
    description: `Dùng cho cả */api/app/user/createHome* và */api/app/user/updateHome* `,
  })
  @UseFilters(MulterBadRequestFilter)
  @UseInterceptors(FileInterceptor('userHomeImage', multerImgConfig))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(UserHomeImageResDto) })
  async uploadHomeImage(@GetUserApp() user: authInterface.ITokenUserApp, @Body() dto: UploadUserHomeImageDto, @UploadedFile() userHomeImage: Express.Multer.File) {
    const result = await this.userHomeAppService.uploadHomeImage(user.userCode, dto, userHomeImage);
    return {
      message: result.filename != '' ? Msg.UploadOk : Msg.UploadErr,
      data: result,
    };
  }
}
