import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException({ message: 'API Key is missing', data: 0 });
    }

    const validApiKey = this.configService.get<string>('REVENUE_CAT_API_KEY');

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException({ message:'Invalid API Key', data: 0 });
    }

    return true;
  }
}
