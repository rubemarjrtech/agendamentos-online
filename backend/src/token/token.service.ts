import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import tokenConfig from './config/token-config';
import { Roles } from '@prisma/client';
import { TokenServiceProtocol } from './token.service.protocol';

export interface TokenPayload {
  sub: string;
  email: string;
  role: Roles;
}

@Injectable()
export class TokenService implements TokenServiceProtocol {
  constructor(
    @Inject(tokenConfig.KEY)
    private readonly config: ConfigType<typeof tokenConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async generateAsync<T extends object>(payload: T): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.JWT_SECRET,
      audience: this.config.JWT_AUD,
      issuer: this.config.JWT_ISSUER,
    });
  }

  async verifyAsync<R extends object>(token: string): Promise<R> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.config.JWT_SECRET,
      audience: this.config.JWT_AUD,
      issuer: this.config.JWT_ISSUER,
    });
  }
}
