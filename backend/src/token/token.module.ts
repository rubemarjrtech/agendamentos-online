import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import tokenConfig from './config/token-config';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule.forFeature(tokenConfig),
    JwtModule.register({
      global: false,
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
