import { Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import cacheConfig from '@cache/config/cache.config';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { REDIS_CLIENT } from '@cache/constants/redis-client';
import { CacheServiceProtocol } from './cache.service.protocol';
import { CacheService } from './cache.service';

@Module({
  imports: [ConfigModule.forFeature(cacheConfig)],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [cacheConfig.KEY],
      useFactory: (redisConfig: ConfigType<typeof cacheConfig>) => {
        return new Redis({
          host: redisConfig.REDIS_HOST,
          port: Number(redisConfig.REDIS_PORT),
          password: redisConfig.REDIS_PASSWORD,
        });
      },
    },
    {
      provide: CacheServiceProtocol,
      useClass: CacheService,
    },
  ],
  exports: [CacheServiceProtocol],
})
export class CacheModule {}
