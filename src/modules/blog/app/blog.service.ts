import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/common/logger/logger.service';
import { ChatService } from 'src/common/chat/chat.service';
import { BlogAdppRepository } from './blog.repository';

@Injectable()
export class BlogAppService {
  private readonly SERVICE_NAME = 'BlogAppService';

  constructor(
    private readonly blogAppRepository: BlogAdppRepository,
    private readonly chatService: ChatService,
    private readonly logger: LoggingService,
  ) {}
  async getContent(userCode: string): Promise<string> {
    const logbase = `${this.SERVICE_NAME}/getContent`;
    const blog = await this.blogAppRepository.getOneContent();
    const result = blog ? this.chatService.replyBaseOnUserPackage(blog?.blogContent, blog?.isFree, userCode) : '';

    return result;
  }
}
