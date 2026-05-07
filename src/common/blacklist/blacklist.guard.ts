import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { BlacklistService } from './blacklist.service';
import { Msg } from 'src/helpers/message.helper';

@Injectable()
export class BlacklistGuard implements CanActivate {
  private readonly logger = new Logger(BlacklistGuard.name);

  constructor(private readonly blacklistService: BlacklistService) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // Attempt to get IP from x-forwarded-for, req.ip, or remoteAddress
    const forwardedIps = request.headers['x-forwarded-for'];
    const clientIp = typeof forwardedIps === 'string' 
      ? forwardedIps.split(',')[0].trim() 
      : request.ip || request.socket.remoteAddress || 'unknown';

    if (this.blacklistService.isBlacklisted(clientIp)) {
      this.logger.log(`Blocked request from blacklisted IP: ${clientIp} to ${request.url}`);
      throw new ForbiddenException(Msg.Blacklisted);
    }

    return true;
  }
}
