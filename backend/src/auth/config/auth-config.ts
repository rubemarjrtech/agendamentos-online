import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
}));
