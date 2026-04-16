import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    console.log("Authorization Header Received: ", authHeader);
    
    // Bóc tách key sau tiền tố "x-api-key "
    const apiKey = authHeader?.replace(/x-api-key\s+/i, '').trim();
    console.log("Extracted API Key: ", apiKey);

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
