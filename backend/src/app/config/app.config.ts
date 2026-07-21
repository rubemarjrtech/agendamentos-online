import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export default (app: INestApplication) => {
  app.setGlobalPrefix('/api');

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
    });
  }

  return app;
};
