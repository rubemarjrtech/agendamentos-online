import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TokenPayload } from '@token/token.service';
import { TokenServiceProtocol } from '@token/token.service.protocol';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenServiceProtocol) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['ACCESS_TOKEN'];

    if (!token) {
      throw new UnauthorizedException('Token não fornecido ou cookie ausente');
    }

    const payload = await this.tokenService.verifyAsync<TokenPayload>(token);
    request['user'] = payload;

    return true;
  }
}
