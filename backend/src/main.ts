import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@app/app.module';
import appConfig from '@app/config/app.config';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const nestApp = await NestFactory.create<NestExpressApplication>(AppModule);
  nestApp.set('trust proxy', 1);
  const app = appConfig(nestApp);

  await app.listen(process.env.PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
