import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IUserAdmin } from 'src/modules/user/admin/user.interface';
import { IUserApp } from 'src/modules/user/app/user.interface';

export const GetUserApp = createParamDecorator<IUserApp>((data: unknown, ctx: ExecutionContext): IUserApp => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});

export const GetUserAdmin = createParamDecorator<IUserAdmin>((data: unknown, ctx: ExecutionContext): IUserAdmin => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
