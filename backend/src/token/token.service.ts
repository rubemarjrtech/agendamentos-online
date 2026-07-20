import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { ConfigType } from '@nestjs/config';
import tokenConfig from './config/token-config';
import { Roles } from '@prisma/client';

export interface TokenPayload {
  sub: string;
  email: string;
  role: Roles;
}

@Injectable()
export class TokenService {
  constructor(
    @Inject(tokenConfig.KEY)
    private readonly config: ConfigType<typeof tokenConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async generate(payload: TokenPayload): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.JWT_SECRET,
      audience: this.config.JWT_AUD,
      issuer: this.config.JWT_ISSUER,
    });
  }

  async verify(token: string): Promise<TokenPayload> {
    return await this.jwtService.verifyAsync(token, {
      secret: this.config.JWT_SECRET,
      audience: this.config.JWT_AUD,
      issuer: this.config.JWT_ISSUER,
    });
  }
}
