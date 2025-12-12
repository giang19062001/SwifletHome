import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(NotFoundException)
export class PageNotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // tự động điều hướng sang trang 404.ejs
    response.status(404).render('pages/404', {
      title: '404',
      isLayout: false,
      user: request.session?.user, 
    });
  }
}
