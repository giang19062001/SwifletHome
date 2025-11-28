import { Injectable } from '@nestjs/common';
import { IBlog } from '../blog.interface';
import { BlogAdppRepository } from './blog.repository';

@Injectable()
export class BlogAppService {
  constructor(private readonly blogAppRepository: BlogAdppRepository) {}
  async getContent(): Promise<IBlog | null> {
    const result = await this.blogAppRepository.getOne();
    return result;
  }

}
