import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { TodoAdminRepository } from './todo.repository';
import { ITodoTask } from '../todo.interface';

@Injectable()
export class TodoAdminService   {
  constructor(private readonly todoAdminRepository: TodoAdminRepository) {
  }
  async getAllTasks(dto: PagingDto): Promise<IList<ITodoTask>> {
    const total = await this.todoAdminRepository.getTotalTasks();
    const list = await this.todoAdminRepository.getAllTasks(dto);
    return { total, list };
  }

}
