import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { DatabaseModule } from '@database/database.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@cache/cache.module';
import { AuthModule } from '@auth/auth.module';
import { SchedulingModule } from '@scheduling/scheduling.module';
import { AdminModule } from '@admin/admin.module';
import { APP_PIPE, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { JwtErrorFilter } from '@common/filters/jwt-error.filter';
import { TokenModule } from '@token/token.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    CacheModule,
    AuthModule,
    SchedulingModule,
    AdminModule,
    TokenModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ transform: true, whitelist: true }),
    },
    {
      provide: APP_FILTER,
      useClass: JwtErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
