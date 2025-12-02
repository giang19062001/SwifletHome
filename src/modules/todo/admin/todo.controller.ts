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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ApiAuthAdminGuard } from 'src/modules/auth/admin/auth.api.guard';
import { ITodoTask } from '../todo.interface';
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
  async getAllTasks(
    @Body() dto: PagingDto,
  ): Promise<IList<ITodoTask>> {
    const result = await this.todoAdminService.getAllTasks(dto);
    return result;
  }
}
