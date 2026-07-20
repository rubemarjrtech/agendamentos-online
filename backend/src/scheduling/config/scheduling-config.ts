import { registerAs } from '@nestjs/config';

export default registerAs('scheduling', () => ({
  REDIS_LOCK_PREFIX: 'lock:service',
  REDIS_LOCK_TTL_SECONDS: 300,
  POLLING_INTERVAL_MS: 5000,
}));
