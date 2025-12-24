import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { TodoAdminRepository } from './todo.repository';
import { ITodoBoxTask, ITodoTask } from '../todo.interface';
import { UpdateBoxTaskArrayDto, UpdateBoxTaskDto } from './todo.dto';

@Injectable()
export class TodoAdminService {
  constructor(private readonly todoAdminRepository: TodoAdminRepository) {}
  async getAllTasks(dto: PagingDto): Promise<IList<ITodoTask>> {
    const total = await this.todoAdminRepository.getTotalTasks();
    const list = await this.todoAdminRepository.getAllTasks(dto);
    return { total, list };
  }
  async getBoxTasks(): Promise<ITodoBoxTask[]> {
    const result = await this.todoAdminRepository.getBoxTasks();
    return result;
  }

  async updateBoxTask(dtoParent: UpdateBoxTaskArrayDto, updatedId: string): Promise<number> {
    try {
      for (const dto of dtoParent.boxTasksArray) {
        await this.todoAdminRepository.updateBoxTask(dto, updatedId);
      }
      return 1;
    } catch (error) {
      console.log('updateBoxTask',error);
      return 0;
    }
  }
}
