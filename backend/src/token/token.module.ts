import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import tokenConfig from './config/token-config';
import { TokenService } from './token.service';
import { TokenServiceProtocol } from './token.service.protocol';

@Module({
  imports: [
    ConfigModule.forFeature(tokenConfig),
    JwtModule.register({
      global: false,
    }),
  ],
  providers: [{ provide: TokenServiceProtocol, useClass: TokenService }],
  exports: [TokenServiceProtocol],
})
export class TokenModule {}
