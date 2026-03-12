import { Controller, Post, Body, HttpStatus, HttpCode, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResponseAppInterceptor } from 'src/interceptors/response.interceptor';
import { ApiAuthAppGuard } from 'src/modules/auth/app/auth.guard';
import { GetUserApp } from 'src/decorator/auth.decorator';
import { Msg } from 'src/helpers/message.helper';
import { ConsignmentAppService } from './consigment.service';
import { RequestConsigmentDto } from './consigment.dto';
import { NumberOkResponseDto } from 'src/dto/common.dto';
import { TokenUserAppResDto } from "src/modules/auth/app/auth.dto";

@ApiTags('app/consignment')
@Controller('/api/app/consignment')
@ApiBearerAuth('app-auth')
@UseGuards(ApiAuthAppGuard)
@UseInterceptors(ResponseAppInterceptor)
export class ConsignmentAppController {
  constructor(private readonly consignmentAppService: ConsignmentAppService,
  ) {}

  @Post('requestConsigment')
  @ApiBody({
    type: RequestConsigmentDto,
    description: `
**senderName**: tên người gửi\n
**senderPhone**: sđt người gửi *\n
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

}
