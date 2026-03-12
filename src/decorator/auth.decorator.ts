import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenUserAdminResDto } from "../modules/auth/admin/auth.dto";
import { TokenUserAppResDto } from "../modules/auth/app/auth.dto";

export const GetUserApp = createParamDecorator<TokenUserAppResDto>((data: unknown, ctx: ExecutionContext): TokenUserAppResDto => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});

export const GetUserAdmin = createParamDecorator<TokenUserAdminResDto>((data: unknown, ctx: ExecutionContext): TokenUserAdminResDto => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
