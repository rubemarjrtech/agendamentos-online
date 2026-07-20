import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: process.env.REDIS_PORT as string,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
}));
