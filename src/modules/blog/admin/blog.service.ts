import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { CreateBlogDto, GetAllBlogDto, UpdateBlogDto } from './blog.dto';
import { BlogAdminRepository } from './blog.repository';
import { IBlog } from '../blog.interface';

@Injectable()
export class BlogAdminService {
  constructor(private readonly blogAdminRepository: BlogAdminRepository) {}
  async getAll(dto: GetAllBlogDto): Promise<IList<IBlog>> {
    const total = await this.blogAdminRepository.getTotal(dto);
    const list = await this.blogAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(blogCode: string): Promise<IBlog | null> {
    const result = await this.blogAdminRepository.getDetail(blogCode);
    return result;
  }
  async create(dto: CreateBlogDto): Promise<number> {
    const result = await this.blogAdminRepository.create(dto);
    return result;
  }
  async update(dto: UpdateBlogDto, blogCode: string): Promise<number> {
    const result = await this.blogAdminRepository.update(dto, blogCode);
    return result;
  }
  async delete(blogCode: string): Promise<number> {
    const result = await this.blogAdminRepository.delete(blogCode);
    return result;
  }
}
