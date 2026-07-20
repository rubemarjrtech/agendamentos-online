import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  ADMIN_USER: process.env.ADMIN_USER as string,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
}));
