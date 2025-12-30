import { Controller, Post, Body, Res, HttpStatus, Req, Get, HttpCode, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { ApiMutationResponse, IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ITodoBoxTask, ITodoTask } from '../todo.interface';
import { TodoAdminService } from './todo.service';
import { SetTaskAlarmByAdminDto, UpdateBoxTaskArrayDto, UpdateBoxTaskDto } from './todo.dto';
import { GetUserAdmin } from 'src/decorator/auth.decorator';
import * as authInterface from 'src/modules/auth/admin/auth.interface';

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
  async getAllTasks(@Body() dto: PagingDto): Promise<IList<ITodoTask>> {
    const result = await this.todoAdminService.getAllTasks(dto);
    return result;
  }

  @Get('getBoxTasks')
  @HttpCode(HttpStatus.OK)
  async getBoxTasks(): Promise<ITodoBoxTask[]> {
    const result = await this.todoAdminService.getBoxTasks();
    return result;
  }

 
   @ApiBody({ type: SetTaskAlarmByAdminDto })
   @Post('setTaskAlarmByAdmin')
   @HttpCode(HttpStatus.OK)
   async setTaskAlarmByAdmin(@Body() dto: SetTaskAlarmByAdminDto, @GetUserAdmin() admin: authInterface.ITokenUserAdmin): Promise<ApiMutationResponse> {
     const result = await this.todoAdminService.setTaskAlarmByAdmin(dto, admin.userId);
     return result;
   }

  @ApiBody({ type: UpdateBoxTaskArrayDto })
  @Put('updateBoxTask')
  @HttpCode(HttpStatus.OK)
  async update(@Body() dtoParent: UpdateBoxTaskArrayDto, @GetUserAdmin() admin: authInterface.ITokenUserAdmin): Promise<number> {
    const result = await this.todoAdminService.updateBoxTask(dtoParent, admin.userId);
    if (result === 0) {
      throw new BadRequestException();
    }
    return result;
  }
}
