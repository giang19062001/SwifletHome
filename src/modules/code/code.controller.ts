import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, Delete, Param, BadRequestException, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetCodeDto } from './code.dto';
import { ResponseAppInterceptor } from 'src/interceptors/response';
import { ICode } from './code.interface';
import { CodeService } from './code.service';

@ApiTags('app/code')
@Controller('/api/app/code')
@UseInterceptors(ResponseAppInterceptor)
export default class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @ApiBody({
    description: `
  **\`mainCode\`**: - **\`SUBMIT\`** - đăng ký tham quan nhà yến  
  **\`subCode\`**:
  - **\`STATUS\`** - trạng thái đăng ký tham quan nhà yến  \n
  - **\`NUMBER_ATTEND\`** - số lượng người đăng ký tham quan nhà yến
  `,
    type: GetCodeDto,
  })
  @Post('getAll')
  @HttpCode(HttpStatus.OK)
  async getAll(@Body() dto: GetCodeDto): Promise<ICode[]> {
    const result = await this.codeService.getAll(dto);
    if (result.length == 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
