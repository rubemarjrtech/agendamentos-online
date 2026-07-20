import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashService } from './hash/hash.service';
import authConfig from './config/auth-config';
import { TokenModule } from '@token/token.module';
import { HashServiceProtocol } from './hash/hash.service.protocol';

@Module({
  imports: [ConfigModule.forFeature(authConfig), TokenModule],
  controllers: [AuthController],
  providers: [AuthService, { provide: HashServiceProtocol, useClass: HashService }],
  exports: [AuthService],
})
export class AuthModule {}
