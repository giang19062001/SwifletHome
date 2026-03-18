import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { ApiAppResponseDto } from 'src/dto/app.dto';
import { ListResponseDto, NullResponseDto, NumberOkResponseDto } from 'src/dto/common.dto';
import { Msg } from 'src/helpers/message.helper';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { TokenUserAppResDto } from 'src/modules/auth/app/auth.dto';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetAllConsignmentDto, RequestConsigmentDto } from './consigment.dto';
import { ConsignmentAppService } from './consigment.service';
import { GetAllConsignmentResDto, GetDetailConsignmentResDto } from './consignment.response';

@ApiTags('app/consignment')
@Controller('/api/app/consignment')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ConsignmentAppController {
  constructor(private readonly consignmentAppService: ConsignmentAppService) {}

  @ApiOperation({
    summary: 'Yêu cầu ký gửi',
  })
  @Post('requestConsigment')
  @ApiBody({
    type: RequestConsigmentDto,
    description: `
**senderName**: tên người gửi\n
**senderPhone**: sđt người gửi \n
**nestType**: loại yến ( mã code từ API /app/options/getAll {  "mainOption": "CONSIGNMENT_NEST", "subOption": "NEST_TYPE",})\n
**nestQuantity**: số lượng yến\n
**deliveryAddress**: địa chỉ cần giao\n
**receiverName**: tên người nhận \n
**receiverPhone**: sđt người nhận \n
  `,
  })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: NumberOkResponseDto })
  async requestConsigment(@GetUserApp() user: TokenUserAppResDto, @Body() dto: RequestConsigmentDto) {
    const result = await this.consignmentAppService.requestConsigment(user.userCode, dto);
    if (result === -1) {
      throw new BadRequestException({
        message: Msg.CodeInvalid,
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

  @ApiOperation({
    summary: 'Lấy danh sách ký gửi',
  })
  @ApiBody({
    type: GetAllConsignmentDto,
    description: `
**consignmentStatus**: enum('ALL','WAITING','CONFIRMED','DELIVERING','CANCEL','DELIVERED','RETURN)  `,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(ListResponseDto(GetAllConsignmentResDto)), description: '**deliveringAddressList**: Không sử dụng filed này nữa -> sẽ luôn rỗng ⚠️' })
  async getAllConsignment(@GetUserApp() user: TokenUserAppResDto, @Body() dto: GetAllConsignmentDto): Promise<{ total: number; list: GetAllConsignmentResDto[] }> {
    const result = await this.consignmentAppService.getAllConsignment(dto, user.userCode);
    return result;
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết ký gửi',
  })
  @ApiParam({ name: 'consignmentCode', type: String })
  @Get('getDetail/:consignmentCode')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: ApiAppResponseDto(GetDetailConsignmentResDto) })
  @ApiBadRequestResponse({ type: NullResponseDto })
  async getDetail(@Param('consignmentCode') consignmentCode: string, @GetUserApp() user: TokenUserAppResDto): Promise<GetDetailConsignmentResDto | null> {
    const result = await this.consignmentAppService.getDetailConsignment(consignmentCode, user.userCode);
    return result;
  }
}
