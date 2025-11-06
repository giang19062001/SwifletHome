import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/common';
import { IList } from 'src/interfaces/common';
import {
  CreateBlogDto,
  GetAllBlogDto,
  UpdateBlogDto,
} from './blog.dto';
import { BlogAdminRepository } from './blog.repository';
import { IBlog } from '../blog.interface';

@Injectable()
export class BlogAdminService {
  constructor(
    private readonly blogAdminRepository: BlogAdminRepository,
  ) {}
  async getAll(dto: GetAllBlogDto): Promise<IList<IBlog>> {
    const total = await this.blogAdminRepository.getTotal(dto);
    const list = await this.blogAdminRepository.getAll(dto);
    return { total, list };
  }
  async getDetail(blogCode: string): Promise<IBlog | null> {
    const result = await this.blogAdminRepository.getDetail(blogCode);
    return result;
  }
  async createBlog(dto: CreateBlogDto): Promise<number> {
    const result = await this.blogAdminRepository.createBlog(dto);
    return result;
  }
  async updateBlog(dto: UpdateBlogDto, blogCode: string): Promise<number> {
    const result = await this.blogAdminRepository.updateBlog(dto, blogCode);
    return result;
  }
  async deleteBlog(blogCode: string): Promise<number> {
    const result = await this.blogAdminRepository.deleteBlog(blogCode);
    return result;
  }
}
