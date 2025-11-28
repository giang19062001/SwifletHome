import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ITokenUserAdmin } from 'src/modules/auth/admin/auth.interface';
import { ITokenUserApp } from 'src/modules/auth/app/auth.interface';

export const GetUserApp = createParamDecorator<ITokenUserApp>((data: unknown, ctx: ExecutionContext): ITokenUserApp => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});

export const GetUserAdmin = createParamDecorator<ITokenUserAdmin>((data: unknown, ctx: ExecutionContext): ITokenUserAdmin => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
