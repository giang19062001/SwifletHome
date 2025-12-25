import { Injectable } from '@nestjs/common';
import { PagingDto } from 'src/dto/admin.dto';
import { IList } from 'src/interfaces/admin.interface';
import { ChangToMainBlogDto, CreateBlogDto, GetAllBlogDto, UpdateBlogDto } from './blog.dto';
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
  async create(dto: CreateBlogDto, createdId: string): Promise<number> {
    // kiểm tra có blog nào là chính hay chưa
    const homeMain = await this.blogAdminRepository.getMainBlog();
    let isMain = 'N';
    if (!homeMain) {
      isMain = 'Y';
    }
    const result = await this.blogAdminRepository.create(dto, isMain, createdId);
    return result;
  }
  async update(dto: UpdateBlogDto, updatedId: string, blogCode: string): Promise<number> {
    const result = await this.blogAdminRepository.update(dto, updatedId, blogCode);
    return result;
  }
  async changeToMain(dto: ChangToMainBlogDto, updatedId: string, blogCode: string): Promise<number> {
    // biến các blog khác với isMain thành 'N'
    await this.blogAdminRepository.changeToNotMain(updatedId, blogCode);
    // cập nhập blog hiện tại với isMain thành 'Y'
    const result = await this.blogAdminRepository.changeToMain(updatedId, blogCode);
    return result;
  }
  async delete(blogCode: string): Promise<number> {
    const result = await this.blogAdminRepository.delete(blogCode);
    return result;
  }
}
