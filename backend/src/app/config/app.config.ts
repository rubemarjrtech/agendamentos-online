import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

export default (app: INestApplication) => {
  app.setGlobalPrefix('/api');
  app.use(cookieParser());

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    });
  }

  return app;
};
