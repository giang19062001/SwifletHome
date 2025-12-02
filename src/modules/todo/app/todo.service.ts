import { Injectable } from '@nestjs/common';
import { ITodoTask } from '../todo.interface';
import { TodoAppRepository } from './todo.repository';


@Injectable()
export class TodoAppService  {
  constructor(private readonly todoAppRepository: TodoAppRepository) {
  }
  async getTasks(): Promise<ITodoTask[]> {
    const result = await this.todoAppRepository.getTasks();
    return result;
  }
}
