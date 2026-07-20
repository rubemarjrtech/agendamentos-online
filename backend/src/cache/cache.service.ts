import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheServiceProtocol } from './cache.service.protocol';
import { REDIS_CLIENT } from './constants/redis-client';

@Injectable()
export class CacheService extends CacheServiceProtocol {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {
    super();
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async setNx(key: string, value: string, TTL: number): Promise<boolean> {
    const result = await this.redis.set(key, value, 'EX', TTL, 'NX');

    return result === 'OK';
  }

  async exists(key: string): Promise<number> {
    return await this.redis.exists(key);
  }

  async remove(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
