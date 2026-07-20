import { registerAs } from '@nestjs/config';

export default registerAs('token', () => ({
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_AUD: process.env.JWT_AUD,
  JWT_ISSUER: process.env.JWT_AUD,
}));
