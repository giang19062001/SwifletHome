import { Injectable } from '@nestjs/common';
import { IBlog } from '../blog.interface';
import { BlogAdppRepository } from './blog.repository';
import { SearchService } from 'src/common/search/search.service';
import { LoggingService } from 'src/common/logger/logger.service';

@Injectable()
export class BlogAppService {
  private readonly SERVICE_NAME = 'BlogAppService';

  constructor(
    private readonly blogAppRepository: BlogAdppRepository,
    private readonly searchService: SearchService,
    private readonly logger: LoggingService,
  ) {}
  async getContent(userCode: string): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/getContent`;

    const blog = await this.blogAppRepository.getOneContent();
    this.logger.log(logbase, `userCode(${userCode})`);
    const result = blog ? this.searchService.replyBaseOnUserPackage(blog?.blogContent, blog?.isFree, userCode) : '';

    return result;
  }
}
