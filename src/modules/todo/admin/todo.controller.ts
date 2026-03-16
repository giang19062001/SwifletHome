import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiMutationResponse } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { TokenUserAdminResDto } from "src/modules/auth/admin/auth.dto";
import { TodoBoxTaskResDto, TodoTaskResDto } from "../todo.response";
import { SetTaskAlarmByAdminDto, UpdateBoxTaskArrayDto } from './todo.dto';
import { TodoAdminService } from './todo.service';

@ApiBearerAuth('admin-auth')
@ApiTags('admin/todo')
@UseGuards(ApiAuthAdminGuard)
@Controller('/api/admin/todo')
export class TodoAdminController {
  constructor(private readonly todoAdminService: TodoAdminService) {}

  @ApiBody({
    type: PagingDto,
  })
  @Post('getAllTasks')
  @HttpCode(HttpStatus.OK)
  async getAllTasks(@Body() dto: PagingDto): Promise<{ total: number; list: TodoTaskResDto[] }> {
    const result = await this.todoAdminService.getAllTasks(dto);
    return result;
  }

  @Get('getBoxTasks')
  @HttpCode(HttpStatus.OK)
  async getBoxTasks(): Promise<TodoBoxTaskResDto[]> {
    const result = await this.todoAdminService.getBoxTasks();
    return result;
  }

 
   @ApiBody({ type: SetTaskAlarmByAdminDto })
   @Post('setTaskAlarmByAdmin')
   @HttpCode(HttpStatus.OK)
   async setTaskAlarmByAdmin(@Body() dto: SetTaskAlarmByAdminDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<ApiMutationResponse> {
     const result = await this.todoAdminService.setTaskAlarmByAdmin(dto, admin.userId);
     return result;
   }

  @ApiBody({ type: UpdateBoxTaskArrayDto })
  @Put('updateBoxTask')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dtoParent: UpdateBoxTaskArrayDto, @GetUserAdmin() admin: TokenUserAdminResDto): Promise<number> {
    const result = await this.todoAdminService.updateBoxTask(dtoParent, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
