import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const GetUserApp = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
