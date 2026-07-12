import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenUserAdminResDto } from '../modules/auth/admin/auth.response';
import { TokenEaterAppResDto, TokenUserAppResDto } from '../modules/auth/app/auth.response';

export const GetUserApp = createParamDecorator<TokenUserAppResDto>((data: unknown, ctx: ExecutionContext): TokenUserAppResDto => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});

export const GetEaterApp = createParamDecorator<TokenEaterAppResDto>((data: unknown, ctx: ExecutionContext): TokenEaterAppResDto => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});

export const GetUserAdmin = createParamDecorator<TokenUserAdminResDto>((data: unknown, ctx: ExecutionContext): TokenUserAdminResDto => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
